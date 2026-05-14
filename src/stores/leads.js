import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { usePricingStore } from './pricing'

export const useLeadStore = defineStore('leads', {
  state: () => ({
    leads: [],
    searchHistory: [],
    currentBatchId: null,
    isScraping: false,
    isLoading: false,
    error: null
  }),

  getters: {
    leadCount: (state) => state.leads.length,
    freshLeads: (state) => state.leads.filter(l => l.status === 'Fresh'),
    vaultLeads: (state) => state.leads.filter(l => l.status === 'Vault'),
    pendingSearches: (state) => state.searchHistory.filter(s => s.status === 'pending' || s.status === 'processing'),
    
    // Tells the user how much their "Vault" is worth based on currency
    vaultEstimatedValue: (state) => {
      const pricingStore = usePricingStore()
      const isNGN = pricingStore.currency === 'NGN'
      const pricePerLead = isNGN ? 50 : 0.18 // Base valuation
      const total = state.leads.length * pricePerLead
      
      return new Intl.NumberFormat(isNGN ? 'en-NG' : 'en-US', {
        style: 'currency',
        currency: pricingStore.currency
      }).format(total)
    },
    
    // Progress percentage for the UI
    searchProgress: (state) => {
      const active = state.searchHistory.find(s => s.status === 'processing')
      if (!active || !active.leads_requested) return 0
      return Math.min(100, Math.round((state.leads.length / active.leads_requested) * 100))
    }
  },

  actions: {
    // Fetch all leads for the current user
    async fetchLeads() {
      this.isLoading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        this.leads = data || []
      } catch (err) {
        console.error('Failed to fetch leads:', err)
        this.error = err.message
      } finally {
        this.isLoading = false
      }
    },

    // Fetch search history / activity log
    async fetchSearchHistory() {
      try {
        const { data, error } = await supabase
          .from('activity')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        this.searchHistory = data || []
      } catch (err) {
        console.error('Failed to fetch search history:', err)
      }
    },

    // Create a new activity entry when a search starts
    async createSearchActivity(userId, query, location, volume) {
      const batchId = crypto.randomUUID()
      this.currentBatchId = batchId

      try {
        const { data, error } = await supabase
          .from('activity')
          .insert({
            user_id: userId,
            search_query: query,
            search_location: location,
            leads_requested: volume,
            cost_in_credits: volume,
            batch_id: batchId,
            status: 'processing'
          })
          .select()
          .single()

        if (error) throw error
        this.searchHistory.unshift(data)
        return { batchId, activityId: data.id }
      } catch (err) {
        console.error('Failed to create search activity:', err)
        throw err
      }
    },

    // Mark activity as completed after n8n returns
    async completeSearchActivity(activityId, leadsFound) {
      try {
        const { error } = await supabase
          .from('activity')
          .update({
            status: 'completed',
            leads_found: leadsFound,
            completed_at: new Date().toISOString()
          })
          .eq('id', activityId)

        if (error) throw error

        // Update local state
        const activity = this.searchHistory.find(a => a.id === activityId)
        if (activity) {
          activity.status = 'completed'
          activity.leads_found = leadsFound
        }
      } catch (err) {
        console.error('Failed to complete activity:', err)
      }
    },

    // Mark activity as failed
    async failSearchActivity(activityId) {
      try {
        await supabase
          .from('activity')
          .update({ status: 'failed', completed_at: new Date().toISOString() })
          .eq('id', activityId)

        const activity = this.searchHistory.find(a => a.id === activityId)
        if (activity) activity.status = 'failed'
      } catch (err) {
        console.error('Failed to update activity:', err)
      }
    },

    // Listen for new leads matching a batch_id via Postgres Changes
    async subscribeToBatchLeads(batchId) {
      if (!batchId) return

      return supabase
        .channel(`batch-${batchId}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'leads', 
            filter: `batch_id=eq.${batchId}` 
          },
          (payload) => {
            console.log('New lead received in real-time!', payload.new)
            // Add lead to UI instantly, prevent duplicates
            if (!this.leads.find(l => l.id === payload.new.id)) {
              this.leads.unshift(payload.new)
            }
          }
        )
        .subscribe()
    },

    // Clear current search results (for UI reset)
    clearResults() {
      this.leads = []
    },

    setScraping(status) {
      this.isScraping = status
    }
  }
})
