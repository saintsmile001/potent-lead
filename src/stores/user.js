import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    subscriptionTier: 'free',
    creditBalance: 0,
    user: { name: '', email: '' },
    isLoading: false,
    _subscription: null
  }),

  getters: {
    hasMinimumCredits: (state) => state.creditBalance >= 20,
    isPro: (state) => state.subscriptionTier === 'pro' || state.subscriptionTier === 'agency' || state.subscriptionTier === 'enterprise'
  },

  actions: {
    // Fetch credit balance and profile from Supabase (source of truth)
    async fetchProfile(userId) {
      if (!userId) return
      this.isLoading = true

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email, full_name, credit_balance, subscription_tier')
          .eq('id', userId)
          .single()

        if (error) throw error

        if (data) {
          this.creditBalance = data.credit_balance ?? 0
          this.subscriptionTier = data.subscription_tier ?? 'free'
          this.user = {
            name: data.full_name || '',
            email: data.email || ''
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        this.isLoading = false
      }
    },

    // Real-time Credit Syncing
    subscribeToProfile(userId) {
      if (!userId) return

      // Clean up previous subscription if exists
      if (this._subscription) {
        supabase.removeChannel(this._subscription)
      }

      this._subscription = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
          (payload) => {
            console.log('Real-time balance update:', payload.new.credit_balance)
            this.creditBalance = payload.new.credit_balance ?? this.creditBalance
            this.subscriptionTier = payload.new.subscription_tier ?? this.subscriptionTier
          }
        )
        .subscribe()
    },

    // Update profile info in Supabase
    async saveProfile(userId) {
      if (!userId) return

      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: this.user.name,
            email: this.user.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (error) throw error
        return true
      } catch (err) {
        console.error('Failed to save profile:', err)
        return false
      }
    },

    setProfile(userData) {
      this.user = {
        name: userData?.name || this.user?.name || '',
        email: userData?.email || this.user?.email || ''
      }
    },

    // Deduct credits via Supabase RPC (atomic, server-side)
    async useCredits(userId, amount) {
      if (!userId || amount <= 0) return false

      try {
        const { data, error } = await supabase
          .rpc('deduct_credits', {
            p_user_id: userId,
            p_amount: amount
          })

        if (error) throw error

        if (data === true) {
          // PRO MOVE: Refresh from DB to ensure local state matches the atomic server state
          await this.refreshCredits(userId)
          return true
        }
        return false // Insufficient credits
      } catch (err) {
        console.error('Failed to deduct credits:', err)
        return false
      }
    },

    // Add credits via Supabase RPC (used after payment confirmation)
    async addCredits(userId, amount) {
      if (!userId) return false
      const credits = Number(amount)
      if (!Number.isFinite(credits) || credits <= 0) return false

      try {
        const { error } = await supabase
          .rpc('add_credits', {
            p_user_id: userId,
            p_amount: credits
          })

        if (error) throw error
        this.creditBalance += credits
        return true
      } catch (err) {
        console.error('Failed to add credits:', err)
        return false
      }
    },

    // Refund credits if a search fails to initialize
    async refundCredits(userId, amount) {
      return await this.addCredits(userId, amount)
    },

    // Refresh just the credit balance (lightweight)
    async refreshCredits(userId) {
      if (!userId) return

      const { data, error } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', userId)
        .single()

      if (!error && data) {
        this.creditBalance = data.credit_balance ?? 0
      }
    }
  }
})
