import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    subscriptionTier: 'free',
    creditBalance: 0,
    user: { name: '', email: '' },
    isLoading: false
  }),

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
          this.creditBalance = Math.max(0, this.creditBalance - amount)
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
