<template>
  <div class="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
    
    <!-- Left Side: Branding / Visual (Hidden on mobile) -->
    <div class="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden transition-colors duration-300">
      <!-- Glow effect -->
      <div class="absolute -left-20 -top-20 w-96 h-96 bg-electric-blue/10 dark:bg-electric-blue/20 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div class="relative z-10">
        <router-link to="/" class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyber-lime tracking-tight cursor-pointer">
          POTENT-LEAD
        </router-link>
      </div>

      <div class="relative z-10 max-w-md">
        <h2 class="text-4xl font-bold mb-6 leading-tight">Instant gratification for your sales pipeline.</h2>
        <p class="text-zinc-500 dark:text-zinc-400 text-lg mb-8">
          Join thousands of founders and sales teams scaling their outreach with hyper-verified, intent-driven B2B data.
        </p>
        
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-electric-blue/10 flex items-center justify-center">
              <Check class="w-4 h-4 text-electric-blue" />
            </div>
            <span class="font-medium text-zinc-700 dark:text-zinc-300">Zero subscription fees</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-cyber-lime/10 flex items-center justify-center">
              <Check class="w-4 h-4 text-cyber-lime" />
            </div>
            <span class="font-medium text-zinc-700 dark:text-zinc-300">Real-time SMTP verification</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-electric-blue/10 flex items-center justify-center">
              <Check class="w-4 h-4 text-electric-blue" />
            </div>
            <span class="font-medium text-zinc-700 dark:text-zinc-300">Live scraping capabilities</span>
          </div>
        </div>
      </div>
      
      <div class="relative z-10 text-sm text-zinc-400 dark:text-zinc-500">
        © 2026 Potent-Lead Inc.
      </div>
    </div>

    <!-- Right Side: Auth Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
      <router-link to="/" class="absolute top-8 left-8 lg:hidden text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyber-lime tracking-tight cursor-pointer">
        POTENT
      </router-link>

      <div class="w-full max-w-md">
        <div class="mb-10 text-center lg:text-left">
          <h1 class="text-2xl md:text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
            {{ isForgotPassword ? 'Reset password' : (isLogin ? 'Welcome back' : 'Create an account') }}
          </h1>
          <p class="text-zinc-500 dark:text-zinc-400">
            {{ isForgotPassword ? "Enter your email and we'll send a recovery link." : (isLogin ? 'Enter your details to access the Master Vault.' : 'Start hunting for leads in seconds.') }}
          </p>
        </div>

        <!-- Error Banner -->
        <transition name="fade">
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-red-600 dark:text-red-400">{{ errorMessage }}</p>
            </div>
            <button @click="errorMessage = ''" class="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
        </transition>

        <!-- Success Banner -->
        <transition name="fade">
          <div v-if="successMessage" class="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
            <Check class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <p class="text-sm font-medium text-green-600 dark:text-green-400">{{ successMessage }}</p>
          </div>
        </transition>

        <!-- Google Auth -->
        <div v-if="!isForgotPassword && !recoverySent" class="mb-8">
          <button 
            @click="handleGoogleSignIn" 
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium text-sm shadow-sm dark:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.01 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {{ isLoading ? 'Redirecting...' : 'Continue with Google' }}
          </button>
        </div>

        <div v-if="!isForgotPassword && !recoverySent" class="flex items-center mb-8">
          <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
          <span class="px-4 text-xs text-zinc-400 uppercase tracking-widest font-bold">Or continue with email</span>
          <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
        </div>

        <!-- Recovery Success Message -->
        <div v-if="recoverySent" class="mb-8 p-4 bg-electric-blue/10 border border-electric-blue/20 rounded-xl text-center">
          <Check class="w-8 h-8 text-electric-blue mx-auto mb-2" />
          <h3 class="font-bold text-zinc-900 dark:text-white mb-1">Check your email</h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">We've sent a password recovery link to {{ form.email }}</p>
        </div>

        <!-- Form -->
        <form v-if="!recoverySent" @submit.prevent="handleAuth" class="space-y-5">
          <div v-if="!isLogin && !isForgotPassword">
            <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
            <input 
              v-model="form.name"
              type="text" 
              placeholder="John Doe"
              class="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
              :required="!isLogin"
            >
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
            <input 
              v-model="form.email"
              type="email" 
              placeholder="name@company.com"
              class="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
              required
            >
          </div>
          <div v-if="!isForgotPassword">
            <div class="flex justify-between items-baseline mb-2">
              <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
              <button v-if="isLogin" type="button" @click="isForgotPassword = true" class="text-xs font-medium text-electric-blue hover:underline cursor-pointer">Forgot password?</button>
            </div>
            <input 
              v-model="form.password"
              type="password" 
              placeholder="••••••••"
              class="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
              required
              minlength="6"
            >
            <p v-if="!isLogin" class="text-[10px] text-zinc-400 mt-2">Password must be at least 6 characters.</p>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full py-4 mt-2 bg-electric-blue hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(0,112,243,0.3)] hover:shadow-[0_0_30px_rgba(0,112,243,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
            <template v-else>
              {{ isForgotPassword ? 'Send Recovery Link' : (isLogin ? 'Sign In to Vault' : 'Create Account') }}
              <ArrowRight class="w-5 h-5" />
            </template>
          </button>
        </form>

        <p v-if="isForgotPassword || recoverySent" class="text-center mt-8 text-zinc-500 dark:text-zinc-400 text-sm">
          Remembered your password?
          <button @click="backToLogin" class="font-bold text-zinc-900 dark:text-white hover:text-electric-blue dark:hover:text-electric-blue transition-colors ml-1 cursor-pointer">
            Back to login
          </button>
        </p>
        <p v-else class="text-center mt-8 text-zinc-500 dark:text-zinc-400 text-sm">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <button @click="switchMode" class="font-bold text-zinc-900 dark:text-white hover:text-electric-blue dark:hover:text-electric-blue transition-colors ml-1 cursor-pointer">
            {{ isLogin ? 'Sign up' : 'Log in' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Check, ArrowRight, AlertCircle, X, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/user'
import { supabase } from '../supabase'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()

const isLogin = ref(true)
const isForgotPassword = ref(false)
const recoverySent = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  if (route.query.mode === 'signup') {
    isLogin.value = false
  }
})

const form = reactive({
  name: '',
  email: '',
  password: ''
})

// Map Supabase error codes/messages to user-friendly strings
const getFriendlyError = (error) => {
  const msg = error?.message?.toLowerCase() || ''
  
  if (msg.includes('invalid login credentials')) return 'Incorrect email or password. Please try again.'
  if (msg.includes('email not confirmed')) return 'Please verify your email address before signing in. Check your inbox.'
  if (msg.includes('user already registered')) return 'An account with this email already exists. Try signing in instead.'
  if (msg.includes('signup is not allowed')) return 'New registrations are temporarily disabled. Please try again later.'
  if (msg.includes('email rate limit exceeded')) return 'Too many attempts. Please wait a few minutes before trying again.'
  if (msg.includes('password should be at least')) return 'Password must be at least 6 characters long.'
  if (msg.includes('unable to validate email')) return 'Please enter a valid email address.'
  if (msg.includes('network') || msg.includes('fetch')) return 'Network error. Please check your internet connection.'
  
  // Fallback
  return error?.message || 'An unexpected error occurred. Please try again.'
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const backToLogin = () => {
  isForgotPassword.value = false
  recoverySent.value = false
  clearMessages()
}

const switchMode = () => {
  isLogin.value = !isLogin.value
  clearMessages()
}

const handleGoogleSignIn = async () => {
  clearMessages()
  isLoading.value = true
  try {
    await authStore.signInWithGoogle()
    // Supabase will redirect the browser to Google OAuth, then back to /dashboard
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    isLoading.value = false
  }
}

const handleAuth = async () => {
  clearMessages()

  if (isForgotPassword.value) {
    isLoading.value = true
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: window.location.origin + '/auth'
      })
      if (error) throw error
      recoverySent.value = true
    } catch (error) {
      errorMessage.value = getFriendlyError(error)
    } finally {
      isLoading.value = false
    }
    return
  }

  isLoading.value = true

  try {
    if (isLogin.value) {
      // Sign In
      await authStore.signInWithEmail(form.email, form.password)
      
      // Sync local profile/credit UI state with the authenticated account.
      userStore.setProfile({ name: form.email.split('@')[0], email: form.email })
      
      router.push('/dashboard')
    } else {
      // Sign Up
      const data = await authStore.signUp(form.name,form.email, form.password)
      
      // Check if Supabase requires email confirmation
      if (data?.user?.identities?.length === 0) {
        errorMessage.value = 'An account with this email already exists. Try signing in instead.'
      } else {
        successMessage.value = 'Account created! Please check your email to verify your address before signing in.'
        isLogin.value = true
      }
    }
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
