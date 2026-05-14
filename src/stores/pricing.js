import { defineStore } from 'pinia'

export const usePricingStore = defineStore('pricing', {
  state: () => ({
    countryCode: 'NG',
    currency: 'NGN',
    isLoading: true,
    // The Source of Truth for your packages
    packages: {
      NGN: [
        { name: 'Nano', leads: 50, price: 2500, perLead: 50 },
        { name: 'Starter', leads: 200, price: 8000, perLead: 40 },
        { name: 'Business', leads: 500, price: 17500, perLead: 35, popular: true },
        { name: 'Growth', leads: 1000, price: 30000, perLead: 30 },
        { name: 'Agency', leads: 5000, price: 125000, perLead: 25, bestValue: true },
        { name: 'Enterprise', leads: 10000, price: 200000, perLead: 20 }
      ],
      USD: [
        { name: 'Nano', leads: 50, price: 9, perLead: 0.18 },
        { name: 'Starter', leads: 200, price: 39, perLead: 0.19 },
        { name: 'Business', leads: 500, price: 59, perLead: 0.12, popular: true },
        { name: 'Growth', leads: 1000, price: 99, perLead: 0.10 },
        { name: 'Agency', leads: 5000, price: 399, perLead: 0.08, bestValue: true },
        { name: 'Enterprise', leads: 10000, price: 699, perLead: 0.07 }
      ]
    }
  }),

  getters: {
    // Dynamically returns the correct list based on detected currency
    currentPackages: (state) => state.packages[state.currency] || state.packages.NGN,
    
    currencySymbol: (state) => state.currency === 'NGN' ? '₦' : '$',
    
    paymentProvider: (state) => state.currency === 'NGN' ? 'Paystack' : 'Stripe',

    isNigeria: (state) => state.currency === 'NGN'
  },

  actions: {
    async fetchLocation() {
      this.isLoading = true
      try {
        // We still use the API, but with a shorter timeout and better fallbacks
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout

        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal })
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          this.countryCode = data.country_code
          
          // Regional Logic: Africa uses NGN/Paystack, rest of world uses USD/Stripe
          const africanMarkets = ['NG', 'GH', 'KE', 'ZA']
          this.currency = africanMarkets.includes(this.countryCode) ? 'NGN' : 'USD'
        }
      } catch (error) {
        // PRODUCTION FALLBACK: Always default to your primary market (NGN) if the API fails
        console.warn('Location detection blocked or failed. Defaulting to NGN pricing.')
        this.currency = 'NGN'
        this.countryCode = 'NG'
      } finally {
        this.isLoading = false
      }
    }
  }
})
