-- =============================================
-- POTENT-LEAD: Full Supabase Schema
-- =============================================

-- 1. PROFILES TABLE (extended)
-- Stores user info, role, credit balance, and IP for abuse detection
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  role text default 'user',
  credit_balance integer default 0,
  subscription_tier text default 'free_tier',
  currency text default 'NGN',
  region text default 'NG/Nigeria',
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Auto-update `updated_at` on any profile change
create or replace function update_modified_column()
returns trigger as $$
begin
    NEW.updated_at = now();
    return NEW;
end;
$$ language 'plpgsql';

create trigger update_profiles_modtime
    before update on profiles
    for each row execute procedure update_modified_column();

-- Auto-create profile on signup (with exception handling so it never blocks auth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  begin
    insert into public.profiles (id, email, full_name, credit_balance, currency, subscription_tier)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      20,       -- 20 free starter credits for new users
      'NGN',    -- Default to Nigerian Naira
      'free_tier'
    );
  exception when others then
    -- Log the error but never block the signup
    raise warning 'Profile creation failed for user %: %', new.id, SQLERRM;
  end;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- IP Abuse Detection View: flag IPs with more than 2 accounts
create or replace view ip_abuse_flags as
select ip_address, count(id) as account_count
from profiles
where ip_address is not null
group by ip_address
having count(id) > 2;


-- 2. LEADS TABLE
-- Stores all generated/scraped leads tied to a user
-- Includes address and rating for Google Maps high-value data
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  company_name text,
  website text,
  email text,
  phone text,
  linkedin_url text,
  instagram_url text,
  address text,
  rating numeric,
  status text default 'Vault' check (status in ('Vault', 'Fresh')),
  source text default 'vault',
  search_query text,
  search_location text,
  batch_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Prevent duplicate leads per user (same website = same business)
alter table leads add constraint unique_user_lead unique (user_id, website);

alter table leads enable row level security;

-- Users can only see their own leads
create policy "Users can view own leads." on leads
  for select using (auth.uid() = user_id);

create policy "Users can insert own leads." on leads
  for insert with check (auth.uid() = user_id);

create policy "Service role can insert leads for any user." on leads
  for insert with check (true);

-- Indexes for fast queries
create index if not exists idx_leads_user_id on leads(user_id);
create index if not exists idx_leads_batch_id on leads(batch_id);


-- 3. ACTIVITY / SEARCH HISTORY TABLE
-- Logs every search a user performs
create table if not exists activity (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  search_query text not null,
  search_location text,
  leads_requested integer default 0,
  leads_found integer default 0,
  cost_in_credits integer default 0,
  batch_id uuid,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

alter table activity enable row level security;

create policy "Users can view own activity." on activity
  for select using (auth.uid() = user_id);

create policy "Users can insert own activity." on activity
  for insert with check (auth.uid() = user_id);

create policy "Users can update own activity." on activity
  for update using (auth.uid() = user_id);

create index if not exists idx_activity_user_id on activity(user_id);
create index if not exists idx_activity_batch_id on activity(batch_id);


-- 4. EXPORTS TABLE
-- Tracks CSV downloads
create table if not exists exports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  filename text not null,
  lead_count integer default 0,
  filters jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table exports enable row level security;

create policy "Users can view own exports." on exports
  for select using (auth.uid() = user_id);

create policy "Users can insert own exports." on exports
  for insert with check (auth.uid() = user_id);

create index if not exists idx_exports_user_id on exports(user_id);


-- 5. HELPER: Deduct credits safely (atomic, row-level lock)
create or replace function public.deduct_credits(p_user_id uuid, p_amount integer)
returns boolean as $$
declare
  current_credits integer;
begin
  select credit_balance into current_credits
  from profiles
  where id = p_user_id
  for update;

  if current_credits >= p_amount then
    update profiles
    set credit_balance = credit_balance - p_amount
    where id = p_user_id;
    return true;
  else
    return false;
  end if;
end;
$$ language plpgsql security definer;


-- 6. HELPER: Add credits
create or replace function public.add_credits(p_user_id uuid, p_amount integer)
returns void as $$
begin
  update profiles
  set credit_balance = credit_balance + p_amount
  where id = p_user_id;
end;
$$ language plpgsql security definer;


-- 7. HELPER: Capture user IP server-side (uses Supabase internal headers)
-- This reads the real IP from PostgREST's x-real-ip header — cannot be spoofed from browser
create or replace function public.capture_user_ip()
returns void as $$
begin
  update public.profiles
  set ip_address = current_setting('request.headers', true)::json->>'x-real-ip',
      updated_at = now()
  where id = auth.uid();
end;
$$ language plpgsql security definer;

-- 8. SECURE CREDIT INCREMENT (WEBHOOK HANDLER)
-- Safely increments user credits. Called by n8n after verifying Paystack webhook signature.
CREATE OR REPLACE FUNCTION add_credits_securely(target_user_id UUID, credit_amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET credit_balance = credit_balance + credit_amount
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;
