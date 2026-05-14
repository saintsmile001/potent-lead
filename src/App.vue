<template>
  <div v-if="$route.meta.layout !== 'blank'" class="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden relative transition-colors duration-300">
    
    <!-- Empty Tank Guard Overlay -->
    <div v-if="userStore.creditBalance <= 0" class="absolute inset-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden transition-colors duration-300">
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full"></div>
        <div class="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200 dark:border-red-500/20 relative z-10 transition-colors duration-300">
          <AlertCircle class="w-8 h-8 text-red-600 dark:text-red-500" />
        </div>
        <h2 class="text-3xl font-bold mb-3 text-zinc-900 dark:text-white relative z-10">Your Tank is Empty</h2>
        <p class="text-zinc-500 dark:text-zinc-400 mb-8 relative z-10">You need credits to keep hunting. Top up now to unlock the Master Vault and Live Deep Scrape.</p>
        <button @click="showTopUp = true" class="w-full py-4 bg-electric-blue hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(0,112,243,0.3)] hover:shadow-[0_0_30px_rgba(0,112,243,0.5)] flex items-center justify-center gap-2 relative z-10 cursor-pointer">
          <Zap class="w-5 h-5" />
          Top Up Credits
        </button>
      </div>
    </div>

    <!-- Top Up Modal -->
    <transition name="fade">
      <div v-if="showTopUp" class="absolute inset-0 z-[60] bg-zinc-900/40 dark:bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full relative shadow-2xl transition-colors duration-300 max-h-[90vh] overflow-y-auto">
          <button @click="showTopUp = false" class="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer">
            <X class="w-6 h-6" />
          </button>
          <h2 class="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Add Credits</h2>
          <p class="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">Select a package. Payments via <strong class="text-electric-blue dark:text-cyber-lime">{{ pricingStore.paymentProvider }}</strong>.</p>
          
          <!-- Plans -->
          <div class="space-y-3 mb-6">
            <button v-for="plan in activePlans" :key="plan.leads" @click="simulatePayment(plan.leads)"
              class="w-full flex justify-between items-center p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-electric-blue/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer relative overflow-hidden">
              <div class="relative z-10">
                <span class="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-electric-blue transition-colors">
                  {{ plan.leads.toLocaleString() }} Leads
                </span>
                <span v-if="plan.popular || plan.bestValue" class="text-xs bg-electric-blue/10 dark:bg-electric-blue/20 text-electric-blue px-2 py-0.5 rounded-full ml-2">{{ plan.popular ? 'Popular' : 'Best Value' }}</span>
              </div>
              <span class="font-bold text-electric-blue dark:text-cyber-lime relative z-10">{{ pricingStore.currencySymbol }}{{ plan.price.toLocaleString() }}</span>
            </button>
          </div>

          <!-- Custom Amount -->
          <div class="mb-6 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/50">
            <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Custom Amount (Leads)</label>
            <div class="flex gap-4 items-center">
              <input 
                v-model="customLeads" 
                type="number" 
                placeholder="e.g., 250"
                min="1"
                class="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white focus:border-electric-blue focus:outline-none transition-colors"
              >
              <div class="text-right w-28">
                <span class="block font-bold text-electric-blue text-lg">{{ formatPrice(customPrice, pricingStore.currency) }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center mt-4">
              <p v-if="customPrice > 0 && customPrice < minPurchase" class="text-red-500 text-xs font-medium">Minimum: {{ formatPrice(minPurchase, pricingStore.currency) }}</p>
              <p v-else class="text-zinc-400 text-xs"></p>
              <button 
                @click="simulatePayment(customLeads)" 
                :disabled="!customLeads || customPrice < minPurchase"
                class="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
              >
                Buy
              </button>
            </div>
          </div>

          <!-- Bank Transfer Note (Nigeria only) -->
          <div v-if="pricingStore.isNigeria" class="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl mb-4 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 flex-shrink-0" />
            Bank Transfer & USSD also available at checkout.
          </div>

          <div class="text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <ShieldCheck class="w-4 h-4" />
            Secured by <span class="font-bold text-zinc-700 dark:text-zinc-300">{{ pricingStore.paymentProvider }}</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false" 
      class="fixed inset-0 z-40 bg-zinc-900/50 dark:bg-black/50 backdrop-blur-sm md:hidden"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50 transition-transform duration-300 md:relative md:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-6 flex justify-between items-center">
        <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyber-lime tracking-tight cursor-pointer" @click="$router.push('/'); isSidebarOpen = false">
          POTENT
        </h1>
        <div class="flex items-center gap-2">
          <!-- Theme Toggle in Sidebar Header -->
          <button 
            @click="toggleTheme" 
            class="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            <Moon v-if="isDark" class="w-5 h-5 text-electric-blue" />
            <Sun v-else class="w-5 h-5 text-amber-500" />
          </button>
          <button @click="isSidebarOpen = false" class="md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <nav class="flex-1 px-4 space-y-2 overflow-y-auto mt-2">
        <router-link 
          v-for="item in navigation" 
          :key="item.name" 
          :to="item.path"
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
          :class="[
            $route.path === item.path 
              ? 'bg-electric-blue/10 text-electric-blue border border-electric-blue/20' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border border-transparent'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- User Profile / Credits -->
      <div class="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div class="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden group transition-colors duration-300">
          <div class="absolute inset-0 bg-cyber-lime/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="flex items-center justify-between mb-2 relative z-10">
            <span class="text-sm text-zinc-500 dark:text-zinc-400">Credits</span>
            <span class="text-xs font-bold" :class="userStore.creditBalance > 0 ? 'text-electric-blue dark:text-cyber-lime' : 'text-red-500'">
              {{ Number(userStore.creditBalance).toLocaleString() }} Left
            </span>
          </div>
          <div class="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 relative z-10 mb-3 overflow-hidden">
            <div 
              class="h-1.5 rounded-full transition-all duration-1000" 
              :class="userStore.creditBalance > 0 ? 'bg-electric-blue dark:bg-cyber-lime' : 'bg-red-500'"
              :style="{ width: Math.min(100, (userStore.creditBalance / 10000) * 100) + '%' }"
            ></div>
          </div>
          <button @click="showTopUp = true" class="w-full py-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-lg transition-colors relative z-10 bg-white dark:bg-transparent shadow-sm dark:shadow-none cursor-pointer">
            Top Up
          </button>
        </div>

        <!-- User Info + Sign Out -->
        <div class="mt-3 flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-8 h-8 rounded-full bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-xs font-bold text-electric-blue flex-shrink-0">
              {{ sidebarUserInitial }}
            </div>
            <span class="text-xs text-zinc-500 dark:text-zinc-400 truncate">{{ sidebarUserName }}</span>
          </div>
          <button @click="handleLogout" class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer" title="Sign Out">
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden relative">
      <!-- Mobile Header -->
      <header class="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-30">
        <h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyber-lime tracking-tight" @click="$router.push('/')">POTENT</h1>
        <button @click="isSidebarOpen = true" class="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
          <Menu class="w-6 h-6" />
        </button>
      </header>

      <!-- Glow effect in background -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-electric-blue/5 dark:bg-electric-blue/10 blur-[120px] pointer-events-none"></div>
      
      <div class="flex-1 overflow-y-auto z-10 relative">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
  
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  LayoutDashboard, 
  Search, 
  DownloadCloud, 
  Settings,
  AlertCircle,
  Zap,
  X,
  ShieldCheck,
  Moon,
  Sun,
  Menu,
  LogOut
} from 'lucide-vue-next'
import { usePricingStore } from './stores/pricing'
import { useUserStore } from './stores/user'
import { useAuthStore } from './stores/authStore'
import { useTheme } from './composables/useTheme'
import { useRouter } from 'vue-router'
import { formatPrice, getCustomPricePerLead } from './utils/format'
import { initializePaystack } from './services/paystack'

const pricingStore = usePricingStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const showTopUp = ref(false)
const isSidebarOpen = ref(false)
const customLeads = ref(null)

const customPrice = computed(() => {
  if (!customLeads.value || customLeads.value <= 0) return 0
  const perLead = getCustomPricePerLead(pricingStore.currency, customLeads.value)
  return customLeads.value * perLead
})

const activePlans = computed(() => pricingStore.currentPackages)
const minPurchase = computed(() => pricingStore.isNigeria ? 1500 : 5)

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Lead Search', path: '/search', icon: Search },
  { name: 'My Downloads', path: '/downloads', icon: DownloadCloud },
  { name: 'Settings', path: '/settings', icon: Settings }
]

onMounted(() => {
  pricingStore.fetchLocation()
})

watch(
  () => authStore.user,
  (user) => {
    if (!user?.email) return

    userStore.setProfile({
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      email: user.email
    })
  },
  { immediate: true }
)

const simulatePayment = async (leadsAmount) => {
  if (!leadsAmount || leadsAmount <= 0 || !authStore.user) return

  const price = leadsAmount === customLeads.value 
    ? customPrice.value 
    : activePlans.value.find(p => p.leads === leadsAmount)?.price

  if (pricingStore.paymentProvider === 'Paystack') {
    initializePaystack({
      email: authStore.user.email,
      amount: price,
      leads: leadsAmount,
      userId: authStore.user.id,
      onSuccess: () => {
        showTopUp.value = false
        customLeads.value = null
      }
    })
  } else {
    // Fallback simulation for Stripe
    await userStore.addCredits(authStore.user.id, leadsAmount)
    showTopUp.value = false
    customLeads.value = null
  }
}

const appRouter = useRouter()

const sidebarUserInitial = computed(() => {
  const name = authStore.user?.user_metadata?.full_name || authStore.user?.email || ''
  return name.charAt(0).toUpperCase()
})
const sidebarUserName = computed(() => authStore.user?.user_metadata?.full_name || authStore.user?.email?.split('@')[0] || '')

const handleLogout = async () => {
  isSidebarOpen.value = false
  await authStore.signOut()
  appRouter.push('/')
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
