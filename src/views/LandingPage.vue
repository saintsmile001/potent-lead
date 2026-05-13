<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-x-hidden relative transition-colors duration-300" @mousemove="handleMouseMove">
    <!-- Dynamic Glowing Background -->
    <div 
      class="pointer-events-none absolute inset-0 transition-opacity duration-300 hidden md:block"
      :style="{
        background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(0, 112, 243, 0.1), transparent 40%)`
      }"
    ></div>

    <!-- Navigation -->
    <nav class="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
      <div class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyber-lime tracking-tight">
        POTENT-LEAD
      </div>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-4">
        <button @click="toggleTheme" class="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer" title="Toggle Theme">
          <Moon v-if="isDark" class="w-5 h-5 text-electric-blue" />
          <Sun v-else class="w-5 h-5 text-amber-500" />
        </button>

        <template v-if="!isLoggedIn">
          <router-link to="/auth" class="px-5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">Sign In</router-link>
          <router-link to="/auth?mode=signup" class="px-5 py-2.5 text-sm font-bold bg-electric-blue text-white rounded-full shadow-[0_0_20px_rgba(0,112,243,0.3)] hover:shadow-[0_0_30px_rgba(0,112,243,0.5)] transition-all">Get Started</router-link>
        </template>

        <template v-else>
          <router-link to="/search" class="px-6 py-2.5 text-sm font-bold bg-electric-blue text-white rounded-full shadow-[0_0_20px_rgba(0,112,243,0.3)] hover:shadow-[0_0_30px_rgba(0,112,243,0.5)] transition-all flex items-center gap-2">
            <SearchIcon class="w-4 h-4" /> Find Leads
          </router-link>

          <!-- User Avatar + Dropdown -->
          <div class="relative">
            <button @click="showDropdown = !showDropdown" class="w-10 h-10 rounded-full bg-electric-blue/10 dark:bg-electric-blue/20 border-2 border-electric-blue/30 hover:border-electric-blue flex items-center justify-center text-sm font-bold text-electric-blue hover:bg-electric-blue hover:text-white transition-all cursor-pointer">
              {{ userInitial }}
            </button>
            <transition name="dropdown">
              <div v-if="showDropdown" class="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl dark:shadow-black/30 overflow-hidden z-50">
                <div class="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <p class="text-sm font-bold text-zinc-900 dark:text-white truncate">{{ userName }}</p>
                  <p class="text-xs text-zinc-500 truncate">{{ userEmail }}</p>
                </div>
                <div class="py-1">
                  <router-link to="/dashboard" @click="showDropdown = false" class="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <LayoutDashboard class="w-4 h-4 text-zinc-400" /> Dashboard
                  </router-link>
                  <router-link to="/search" @click="showDropdown = false" class="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <SearchIcon class="w-4 h-4 text-zinc-400" /> Find Leads
                  </router-link>
                  <router-link to="/downloads" @click="showDropdown = false" class="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <DownloadCloud class="w-4 h-4 text-zinc-400" /> My Downloads
                  </router-link>
                  <router-link to="/settings" @click="showDropdown = false" class="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <SettingsIcon class="w-4 h-4 text-zinc-400" /> Settings
                  </router-link>
                </div>
                <div class="border-t border-zinc-100 dark:border-zinc-800 py-1">
                  <button @click="handleLogout" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full cursor-pointer">
                    <LogOut class="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </template>
      </div>

      <!-- Mobile Nav -->
      <div class="flex md:hidden items-center gap-2">
        <button @click="toggleTheme" class="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer">
          <Moon v-if="isDark" class="w-4 h-4 text-electric-blue" />
          <Sun v-else class="w-4 h-4 text-amber-500" />
        </button>
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer">
          <X v-if="mobileMenuOpen" class="w-5 h-5" />
          <MenuIcon v-else class="w-5 h-5" />
        </button>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <transition name="slide-down">
      <div v-if="mobileMenuOpen" class="md:hidden fixed inset-x-0 top-0 z-[15] pt-20 px-6 pb-6 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <template v-if="!isLoggedIn">
          <div class="space-y-3">
            <router-link to="/auth" @click="mobileMenuOpen = false" class="block w-full text-center px-5 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">Sign In</router-link>
            <router-link to="/auth?mode=signup" @click="mobileMenuOpen = false" class="block w-full text-center px-5 py-3 text-sm font-bold bg-electric-blue text-white rounded-xl shadow-md">Get Started</router-link>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div class="w-10 h-10 rounded-full bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center text-sm font-bold text-electric-blue">{{ userInitial }}</div>
            <div>
              <p class="text-sm font-bold text-zinc-900 dark:text-white">{{ userName }}</p>
              <p class="text-xs text-zinc-500">{{ userEmail }}</p>
            </div>
          </div>
          <div class="space-y-1">
            <router-link to="/dashboard" @click="mobileMenuOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"><LayoutDashboard class="w-4 h-4 text-zinc-400" /> Dashboard</router-link>
            <router-link to="/search" @click="mobileMenuOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"><SearchIcon class="w-4 h-4 text-zinc-400" /> Find Leads</router-link>
            <router-link to="/downloads" @click="mobileMenuOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"><DownloadCloud class="w-4 h-4 text-zinc-400" /> My Downloads</router-link>
            <router-link to="/settings" @click="mobileMenuOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"><SettingsIcon class="w-4 h-4 text-zinc-400" /> Settings</router-link>
            <button @click="handleLogout" class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full cursor-pointer mt-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
              <LogOut class="w-4 h-4" /> Sign Out
            </button>
          </div>
        </template>
      </div>
    </transition>

    <!-- Dropdown Backdrop (click to close) -->
    <div v-if="showDropdown" @click="showDropdown = false" class="fixed inset-0 z-[15]"></div>

    <!-- Hero Section -->
    <section class="container mx-auto px-6 pt-32 pb-20 text-center relative z-10">
      <h1 class="hero-title text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-zinc-800 to-zinc-400 dark:from-white dark:to-zinc-500 transition-all duration-300">
        Your Next 1,000<br/>Customers are <span class="text-electric-blue dark:text-cyber-lime">Waiting.</span>
      </h1>
      <p class="hero-subtitle text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 transition-colors duration-300">
        No monthly fees. No waste. Buy exactly the leads you need and start hunting instantly.
      </p>
      
      <!-- Live Feed Hook -->
      <div class="max-w-md mx-auto bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl dark:shadow-2xl overflow-hidden h-20 relative transition-colors duration-300">
        <div class="absolute inset-0 bg-gradient-to-b from-white/50 dark:from-zinc-900/50 via-transparent to-white/50 dark:to-zinc-900/50 pointer-events-none z-10"></div>
        <div class="live-feed-container flex flex-col gap-3 transition-transform duration-500" :style="{ transform: `translateY(-${feedIndex * 44}px)` }">
          <div v-for="(notification, idx) in notifications" :key="idx" class="flex items-center gap-3 text-sm h-8">
            <div class="w-2 h-2 rounded-full bg-electric-blue dark:bg-cyber-lime animate-pulse"></div>
            <span class="text-zinc-600 dark:text-zinc-300"><span class="font-bold text-zinc-900 dark:text-white">{{ notification.user }}</span> {{ notification.action }} <span class="text-electric-blue">{{ notification.result }}</span></span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Bento Grid -->
    <section class="container mx-auto px-6 py-24 relative z-10">
      <h2 class="text-4xl font-bold text-center mb-16 text-zinc-900 dark:text-white transition-colors duration-300">Unfair Advantage Engineering</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto bento-grid">
        <!-- Master Vault Feature -->
        <div class="bento-item md:col-span-2 bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 hover:border-electric-blue/50 transition-colors group relative overflow-hidden shadow-sm dark:shadow-none">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-electric-blue/5 dark:bg-electric-blue/10 blur-[80px] rounded-full group-hover:bg-electric-blue/10 dark:group-hover:bg-electric-blue/20 transition-all"></div>
          <div class="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center mb-6 border border-electric-blue/20">
            <Database class="w-6 h-6 text-electric-blue" />
          </div>
          <h3 class="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">The Master Vault</h3>
          <p class="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">Instant access to over 50 million pre-verified B2B contacts. Filter by niche, technology, and intent data for immediate gratification.</p>
          <div class="flex items-center gap-2 text-sm font-semibold text-electric-blue">
            <span>0.00ms latency to your next lead</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <!-- Live Deep Search Feature -->
        <div class="bento-item bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 hover:border-electric-blue/50 dark:hover:border-cyber-lime/50 transition-colors group relative overflow-hidden shadow-sm dark:shadow-none">
           <div class="absolute -right-20 -top-20 w-64 h-64 bg-electric-blue/5 dark:bg-cyber-lime/10 blur-[80px] rounded-full group-hover:bg-electric-blue/10 dark:group-hover:bg-cyber-lime/20 transition-all"></div>
          <div class="w-12 h-12 rounded-xl bg-electric-blue/10 dark:bg-cyber-lime/10 flex items-center justify-center mb-6 border border-electric-blue/20 dark:border-cyber-lime/20">
            <Globe class="w-6 h-6 text-electric-blue dark:text-cyber-lime" />
          </div>
          <h3 class="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">Live Scrape</h3>
          <p class="text-zinc-500 dark:text-zinc-400">Can't find them in the vault? We'll spin up custom scraping bots in real-time to find fresh data across the web.</p>
        </div>

        <!-- Verification -->
        <div class="bento-item bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm dark:shadow-none">
          <div class="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-700">
            <ShieldCheck class="w-6 h-6 text-zinc-500 dark:text-zinc-300" />
          </div>
          <h3 class="text-xl font-bold mb-3 text-zinc-900 dark:text-white">Zero Bounce Rate</h3>
          <p class="text-zinc-500 dark:text-zinc-400 text-sm">Every single email is verified with SMTP handshakes before it reaches your dashboard.</p>
        </div>

        <!-- Integration -->
        <div class="bento-item md:col-span-2 bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors overflow-hidden relative shadow-sm dark:shadow-none">
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1">
              <div class="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-700">
                <Zap class="w-6 h-6 text-zinc-500 dark:text-zinc-300" />
              </div>
              <h3 class="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">1-Click Export</h3>
              <p class="text-zinc-500 dark:text-zinc-400">Push your pristine lead lists directly to your CRM, cold email tool, or download them as a CSV file.</p>
            </div>
            <div class="flex gap-4">
              <div class="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-md dark:shadow-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"><span class="font-black text-xl">CRM</span></div>
              <div class="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-md dark:shadow-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"><span class="font-black text-xl">CSV</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section: The Fuel Pump -->
    <section class="container mx-auto px-6 py-24 relative z-10 text-center">
      <h2 class="text-4xl font-bold mb-4 text-zinc-900 dark:text-white">Precision Pricing</h2>
      <p class="text-zinc-500 dark:text-zinc-400 mb-12">No subscriptions. No waste. Buy exactly what you need.</p>

      <div class="max-w-2xl mx-auto bg-white/90 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-10 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-xl dark:shadow-none transition-colors duration-300">
        
        <!-- Savings Badge -->
        <transition name="fade">
          <div v-if="savingsAmount" class="absolute top-4 right-4 bg-electric-blue dark:bg-cyber-lime text-white dark:text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-md dark:shadow-[0_0_15px_rgba(204,255,0,0.5)]">
            {{ savingsAmount }}
          </div>
        </transition>

        <div class="mb-10 mt-6">
          <label class="block text-zinc-500 dark:text-zinc-500 mb-6 font-medium uppercase tracking-widest text-xs">How many leads do you need?</label>
          <div class="relative py-4">
            <input 
              type="range" 
              v-model="leadCount" 
              min="100" 
              max="10000" 
              step="100" 
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer custom-slider relative z-10"
            >
          </div>
          <div class="flex flex-col md:flex-row justify-between items-start md:items-end mt-6 gap-4">
            <div class="text-left">
              <span class="block text-3xl md:text-4xl font-black text-zinc-900 dark:text-white">{{ Number(leadCount).toLocaleString() }} Leads</span>
              <span class="text-sm text-electric-blue dark:text-cyber-lime font-medium">Includes {{ Number(leadCount).toLocaleString() }} Verifications</span>
            </div>
            <div class="text-left md:text-right">
              <span class="block text-4xl md:text-5xl font-black text-electric-blue">${{ totalPrice }}</span>
              <span class="text-sm text-zinc-500 font-medium">at ${{ pricePerLead.toFixed(2) }}/lead</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left text-sm p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/50">
          <div class="flex items-center gap-3 text-zinc-600 dark:text-zinc-300"><Check class="w-5 h-5 text-electric-blue" /> Instant Vault Access</div>
          <div class="flex items-center gap-3 text-zinc-600 dark:text-zinc-300"><Check class="w-5 h-5 text-electric-blue" /> SMTP Email Verification</div>
          <div class="flex items-center gap-3 text-zinc-600 dark:text-zinc-300"><Check class="w-5 h-5 text-electric-blue" /> 1-Click CRM Export</div>
          
          <div class="flex items-center gap-3 transition-colors duration-300" :class="hasDeepScrape ? 'text-electric-blue dark:text-cyber-lime font-bold' : 'text-zinc-400 dark:text-zinc-600'">
            <Unlock v-if="hasDeepScrape" class="w-5 h-5" />
            <Lock v-else class="w-5 h-5" />
            Live Deep Scrape <span v-if="!hasDeepScrape" class="text-xs ml-1 font-normal">(Unlocks at 2k)</span>
          </div>
        </div>

        <router-link :to="isLoggedIn ? '/search' : '/auth?mode=signup'" class="w-full py-4 bg-electric-blue hover:bg-blue-600 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(0,112,243,0.3)] hover:shadow-[0_0_30px_rgba(0,112,243,0.5)] flex items-center justify-center gap-2 cursor-pointer">
          <Zap class="w-5 h-5" />
          {{ isLoggedIn ? `Buy ${Number(leadCount).toLocaleString()} Credits` : `Get Started — ${Number(leadCount).toLocaleString()} Leads` }}
        </router-link>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="border-t border-zinc-200 dark:border-zinc-800 py-12 text-center text-zinc-500 text-sm relative z-10 transition-colors duration-300">
      <p>© 2026 Potent-Lead. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Database, Globe, ArrowRight, ShieldCheck, Zap, Check, Lock, Unlock, Moon, Sun, Search as SearchIcon, LayoutDashboard, DownloadCloud, Settings as SettingsIcon, LogOut, Menu as MenuIcon, X } from 'lucide-vue-next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
import { useTheme } from '../composables/useTheme'
import { usePricingStore } from '../stores/pricing'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const { isDark, toggleTheme } = useTheme()
const pricingStore = usePricingStore()
const authStore = useAuthStore()
const router = useRouter()

const isLoggedIn = computed(() => !!authStore.user)
const userInitial = computed(() => {
  const name = authStore.user?.user_metadata?.full_name || authStore.user?.email || ''
  return name.charAt(0).toUpperCase()
})
const userName = computed(() => authStore.user?.user_metadata?.full_name || authStore.user?.email?.split('@')[0] || '')
const userEmail = computed(() => authStore.user?.email || '')

const showDropdown = ref(false)
const mobileMenuOpen = ref(false)

const handleLogout = async () => {
  showDropdown.value = false
  mobileMenuOpen.value = false
  await authStore.signOut()
  router.push('/')
}

// Mouse Tracking for glowing background
const mouseX = ref(window.innerWidth / 2)
const mouseY = ref(window.innerHeight / 2)

const handleMouseMove = (e) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// Live Feed Logic
const feedIndex = ref(0)
let feedInterval

const notifications = [
  { user: 'Sarah J.', action: 'just found', result: '45 SaaS leads in London' },
  { user: 'Mike T.', action: 'exported', result: '120 eCommerce founders' },
  { user: 'Elena V.', action: 'live scraped', result: '30 Real Estate agencies' },
  { user: 'David W.', action: 'verified', result: '85 CTOs in New York' },
  { user: 'Sarah J.', action: 'just found', result: '45 SaaS leads in London' }, // Repeat for loop illusion
]

// Dynamic Pricing Logic
const leadCount = ref(100)

const pricePerLead = computed(() => {
  const isTierA = pricingStore.tier === 'A'
  
  if (leadCount.value < 500) return isTierA ? 0.10 : 0.25
  if (leadCount.value < 2000) return isTierA ? 0.08 : 0.15
  return isTierA ? 0.05 : 0.10
})

const totalPrice = computed(() => (leadCount.value * pricePerLead.value).toFixed(2))

const savingsAmount = computed(() => {
  if (leadCount.value >= 2000) return 'Save 40%'
  if (leadCount.value >= 500) return 'Save 20%'
  return null
})

const hasDeepScrape = computed(() => leadCount.value >= 2000)

onMounted(() => {
  // Feed Animation
  feedInterval = setInterval(() => {
    feedIndex.value++
    if (feedIndex.value >= notifications.length - 1) {
      setTimeout(() => {
        // Reset without animation
        const container = document.querySelector('.live-feed-container')
        if (container) {
          container.style.transition = 'none'
          feedIndex.value = 0
          setTimeout(() => {
             container.style.transition = 'transform 500ms'
          }, 50)
        }
      }, 500) // Wait for transition to finish before resetting
    }
  }, 2500)

  // GSAP Animations
  gsap.from('.hero-title', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
  gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: 'power3.out' })
  gsap.from('.live-feed-container', { opacity: 0, scale: 0.9, duration: 1, delay: 0.4, ease: 'back.out(1.7)' })
  
  gsap.from('.bento-item', {
    scrollTrigger: {
      trigger: ".bento-grid",
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    opacity: 0,
    y: 50,
    stagger: 0.15,
    duration: 1,
    ease: 'power2.out'
  })
})

onUnmounted(() => {
  clearInterval(feedInterval)
})
</script>

<style>
/* Custom Slider Glow */
.custom-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-electric-blue, #0070f3);
  cursor: pointer;
  box-shadow: 0 0 15px rgba(0, 112, 243, 0.4);
  transition: transform 0.1s ease;
}

.dark .custom-slider::-webkit-slider-thumb {
  box-shadow: 0 0 15px rgba(0, 112, 243, 0.8), 0 0 30px rgba(0, 112, 243, 0.4);
}

.custom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(0, 112, 243, 0.8);
}

.dark .custom-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 20px rgba(0, 112, 243, 1), 0 0 40px rgba(0, 112, 243, 0.6);
}

.custom-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-electric-blue, #0070f3);
  cursor: pointer;
  box-shadow: 0 0 15px rgba(0, 112, 243, 0.4);
  transition: transform 0.1s ease;
  border: none;
}

.dark .custom-slider::-moz-range-thumb {
  box-shadow: 0 0 15px rgba(0, 112, 243, 0.8), 0 0 30px rgba(0, 112, 243, 0.4);
}

.custom-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(0, 112, 243, 0.8);
}

.dark .custom-slider::-moz-range-thumb:hover {
  box-shadow: 0 0 20px rgba(0, 112, 243, 1), 0 0 40px rgba(0, 112, 243, 0.6);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* Mobile menu slide */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
