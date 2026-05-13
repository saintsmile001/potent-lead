Project Vision & Aesthetic
Name: Potent-lead.

Core Value: A premium, "Instant-Gratification" lead generation engine.

Design Vibe: "High-Performance Luxury." Use a dark-themed UI (Slate/Zinc) with Electric Blue (#0070f3) and Cyber Lime (#ccff00) accents.

Visual Elements: Use a Bento-Box layout for the dashboard, glassmorphism for cards, and smooth, spring-based animations (GSAP/Framer Motion).

2. User Journey & Screens
The Landing Page:

Hero: A massive headline: "Your Next 1,000 Customers are Waiting."

The Hook: A scrolling "Live Feed" component showing mock notifications (e.g., "John just found 45 leads in London").

Feature Grid: Explain the Master Vault (Instant data) vs. Live Deep Search (Fresh data).

The Auth System:

Minimalist login/signup with social auth options (Google/GitHub).

Post-signup redirect to a "Quick Start" onboarding wizard.

The Dashboard (The Command Center):

Search Console: A beautiful form for "Niche/Category," "Location," and "Volume."

Lead Monitor: A real-time terminal-style window that shows the "Logic Steps" (e.g., "Checking Vault... 40 found. Triggering Live Scrape for 60 remaining...").

Lead Table: A high-performance data table to preview results before downloading.

3. Technical Logic & State Management
State (Pinia):

userStore: Manage auth status, subscription tier, and credit_balance.

leadStore: Manage search history, current search results, and "Scraping" status.

The API Bridge:

Create a central ApiService.js that handles the POST request to the n8n Webhook.

Implement Polling: Since lead generation takes time, the frontend should "listen" for a completion signal from n8n or check a status endpoint.

Credit Logic:

The UI must disable the "Generate" button if credits < requested_amount.

Include a "Top-up Credits" modal that simulates (or integrates) a Stripe Checkout.

4. Database Schema (For Antigravity Context)
Antigravity needs to know the data structure to build the table views:

Leads: id, company_name, website, email, linkedin_url, instagram_url, phone, status (Verified/Vault).

Activity: timestamp, search_query, leads_found, cost_in_credits.

Step-by-Step Implementation Flow
Step 1: Scaffold the Environment
Ask Antigravity:

"Initialize a Vue 3 project with Tailwind CSS and Pinia. Build the App Shell with a sidebar navigation containing 'Dashboard', 'Lead Search', 'My Downloads', and 'Settings'."

Step 2: Build the "Lively" Homepage
Ask Antigravity:

"Create a high-conversion landing page. Use an animated 'Bento Grid' for the features section. Make the Hero section have a glowing gradient background that moves with the mouse. Add a Pricing Section with three tiers: Starter, Professional, and Agency."

Step 3: Develop the Search Interface
Ask Antigravity:

"Build the Lead Search interface. It should have a multi-select for 'Channels' (Google Maps, LinkedIn, Twitter). When the search button is clicked, trigger a complex loading animation that displays 'Searching Vault', 'Cleaning Data', and 'Verifying Emails' in a sequence."

Step 4: The "Vault" Table
Ask Antigravity:

"Create a data table component for lead results. Include 'Filter by Quality' and 'Search within Results' features. Every row should have a status badge: 'Fresh' or 'Vault'. Add a 'Download CSV' button that exports the current view."

Add a Dark/Light mode toggle, but ensure Dark mode is the default, as it feels more "SaaS-like" for lead generation tools.