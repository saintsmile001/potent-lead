import { defineStore } from 'pinia'
import { supabase } from '../supabase'

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
    pendingSearches: (state) => state.searchHistory.filter(s => s.status === 'pending' || s.status === 'processing')
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

    // Poll for new leads matching a batch_id (called after n8n webhook)
    async pollForLeads(batchId, maxAttempts = 20, intervalMs = 3000) {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const { data, error } = await supabase
          .from('leads')
          .select('*', { count: 'exact' })
          .eq('batch_id', batchId)

        if (!error && data && data.length > 0) {
          // New leads found — merge into local state
          const existingIds = new Set(this.leads.map(l => l.id))
          const newLeads = data.filter(l => !existingIds.has(l.id))
          this.leads.unshift(...newLeads)
          return data.length
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      }

      return 0 // No leads found after all attempts
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
