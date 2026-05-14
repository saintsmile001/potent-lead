<template>
  <div class="p-4 md:p-8 max-w-4xl mx-auto w-full h-full">
    <h1 class="text-3xl md:text-4xl font-black mb-2 text-zinc-900 dark:text-white">Settings</h1>
    <p class="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mb-10">Manage your account, preferences, and billing.</p>

    <div class="space-y-8">
      
      <!-- Profile Settings -->
      <section class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 class="text-2xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
          <User class="w-6 h-6 text-electric-blue" />
          Profile Information
        </h2>
        
        <div class="space-y-4 max-w-xl">
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
            <input 
              v-model="userStore.user.name"
              type="text" 
              class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
            >
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
            <input 
              v-model="userStore.user.email"
              type="email" 
              class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
            >
          </div>
          <button 
            @click="saveProfile"
            :disabled="isSaving"
            class="w-full md:w-auto justify-center px-6 py-3 bg-electric-blue hover:bg-blue-600 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isSaving ? 'Saving...' : (saveSuccess ? 'Saved!' : 'Save Changes') }}
          </button>
        </div>
      </section>

      <!-- App Preferences (Dark/Light Mode) -->
      <section class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 class="text-2xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
          <Sliders class="w-6 h-6 text-cyber-lime" />
          App Preferences
        </h2>
        
        <div class="flex items-center justify-between max-w-xl p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div>
            <h3 class="font-bold text-zinc-900 dark:text-white">Theme Appearance</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">Toggle between Dark and Light mode.</p>
          </div>
          <button 
            @click="toggleTheme" 
            class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
            :class="isDark ? 'bg-electric-blue' : 'bg-zinc-300'"
          >
            <span 
              class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
              :class="isDark ? 'translate-x-7' : 'translate-x-1'"
            >
              <Moon v-if="isDark" class="w-4 h-4 m-1 text-electric-blue" />
              <Sun v-else class="w-4 h-4 m-1 text-zinc-400" />
            </span>
          </button>
        </div>
      </section>

      <!-- Billing & Credits -->
      <section class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 class="text-2xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
          <CreditCard class="w-6 h-6 text-electric-blue" />
          Billing & Usage
        </h2>
        
        <div class="max-w-xl">
          <div class="p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl mb-6">
            <h3 class="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-1">Available Credits</h3>
            <div class="text-4xl font-black text-zinc-900 dark:text-white mb-2">
              {{ Number(userStore.creditBalance).toLocaleString() }}
            </div>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">
              Credits are consumed when extracting leads or initiating live scrapes.
            </p>
          </div>

          <div class="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl">
            <h3 class="font-bold text-yellow-800 dark:text-yellow-500 mb-1">Pay-As-You-Go Active</h3>
            <p class="text-sm text-yellow-700 dark:text-yellow-400">
              You are currently on the flexible pricing tier. No monthly subscriptions.
            </p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/authStore'
import { User, Sliders, Moon, Sun, CreditCard } from 'lucide-vue-next'

const { isDark, toggleTheme } = useTheme()
const userStore = useUserStore()
const authStore = useAuthStore()

const isSaving = ref(false)
const saveSuccess = ref(false)

const saveProfile = async () => {
  if (!authStore.user) return
  
  isSaving.value = true
  saveSuccess.value = false
  
  const success = await userStore.saveProfile(authStore.user.id)
  
  isSaving.value = false
  if (success) {
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  }
}
</script>
