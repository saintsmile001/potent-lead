import { defineStore } from 'pinia'

export const usePricingStore = defineStore('pricing', {
  state: () => ({
    countryCode: 'US', // Default
    tier: 'B', // 'A' (Localized) or 'B' (Global)
    currency: '$',
    isLoading: true
  }),
  actions: {
    async fetchLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/')
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        
        this.countryCode = data.country_code
        
        // Tier A: NG, GH, KE
        if (['NG', 'GH', 'KE'].includes(this.countryCode)) {
          this.tier = 'A'
          // We can keep $ for simplicity or switch to local symbols.
          // The prompt says "$10 (or local currency equivalent)". We will stick to $ for standardized display,
          // but apply the localized pricing factor.
          this.currency = '$' 
        } else {
          this.tier = 'B'
          this.currency = '$'
        }
      } catch (error) {
        console.error('Failed to detect location. Falling back to Global Tier B.', error)
        this.tier = 'B'
        this.countryCode = 'Global'
        this.currency = '$'
      } finally {
        this.isLoading = false
      }
    }
  }
})
