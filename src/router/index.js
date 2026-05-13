import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/LandingPage.vue'),
    meta: { layout: 'blank' }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/AuthPage.vue'),
    meta: { layout: 'blank' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Lead Search',
    component: () => import('../views/LeadSearch.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/downloads',
    name: 'My Downloads',
    component: () => import('../views/Downloads.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    // Currently re-using Dashboard as a placeholder for the Admin interface
    component: () => import('../views/Dashboard.vue'), 
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Ensure the auth state is fully loaded from Supabase before making route decisions
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  const isAuthenticated = !!authStore.user
  const isAdmin = authStore.role === 'admin'

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Force unauthenticated users to the auth page
    next({ name: 'Auth' })
  } else if (to.meta.requiresAdmin && !isAdmin) {
    // Force authenticated but non-admin users back to the dashboard
    next({ name: 'Dashboard' })
  } else {
    // Allowed
    next()
  }
})

export default router
