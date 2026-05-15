import { defineStore } from "pinia";
import { supabase } from "../supabase";
import { useUserStore } from "./user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    session: null,
    role: null,
    isInitialized: false,
  }),
  actions: {
    async initializeAuth() {
      // Get initial session on app load
      const {
        data: { session },
      } = await supabase.auth.getSession();

      this.session = session;
      this.user = session?.user || null;

      if (this.user) {
        await this.syncProfile();
        await this.fetchRole();
        await this.trackUserIp(); // Explicitly tracks client IP now

        // Hydrate the user store from Supabase
        const userStore = useUserStore();
        await userStore.fetchProfile(this.user.id);
        userStore.subscribeToProfile(this.user.id);
      }

      this.isInitialized = true;

      // Setup global auth listener for tabs/refreshes
      supabase.auth.onAuthStateChange(async (event, session) => {
        this.session = session;
        this.user = session?.user || null;

        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          // Sync Google OAuth signups to local profiles table
          await this.syncProfile();
          await this.fetchRole();
          await this.trackUserIp(); // Catches the user redirecting back from email verification links

          // Refresh credits/profile from Supabase
          const userStore = useUserStore();
          await userStore.fetchProfile(this.user.id);
          userStore.subscribeToProfile(this.user.id);
        }

        if (event === "SIGNED_OUT") {
          this.signOut(); // Use your clean-up method
        }
      });
    },

    async syncProfile() {
      if (!this.user) return;

      // Upsert into profiles table to sync Identity Data with Public schema
      const { error } = await supabase.from("profiles").upsert(
        {
          id: this.user.id,
          email: this.user.email,
          full_name:
            this.user.user_metadata?.full_name || this.user.email.split("@")[0],
          updated_at: new Date(),
        },
        { onConflict: "id" },
      );

      if (error) console.error("Profile sync error:", error);
    },

    async trackUserIp() {
      try {
        // 1. Fetch the absolute public IP on the client-side browser context
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipRes.json();

        // 2. Pass it into your updated PostgreSQL RPC parameter explicitly
        const { error } = await supabase.rpc("capture_user_ip", {
          user_ip: ip,
        });

        if (error) throw error;
        console.log(`[Auth Store] IP Address (${ip}) logged successfully.`);
      } catch (err) {
        // Non-critical — don't block login if IP capture fails
        console.warn("IP tracking skipped or failed:", err.message);
      }
    },

    async fetchRole() {
      if (!this.user) return;

      // RBAC check: retrieve role from profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", this.user.id)
        .single();

      if (data) {
        this.role = data.role;
      }
    },

    async signUp(name, email, password) {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipRes.json();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            signup_ip: ip,
          },
        },
      });
      if (error) throw error;
      return data;
    },

    async signInWithEmail(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    async signInWithGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
      return data;
    },

    async signOut() {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error during sign out:", error);
      } finally {
        this.user = null;
        this.session = null;
        this.role = null;

        const userStore = useUserStore();
        userStore.$reset();
      }
    },
  },
});
