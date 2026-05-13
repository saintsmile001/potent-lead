<template>
  <div class="p-8 max-w-4xl mx-auto w-full h-full transition-colors duration-300">
    <h1 class="text-4xl font-black mb-2 text-zinc-900 dark:text-white">My Downloads</h1>
    <p class="text-zinc-500 dark:text-zinc-400 mb-10">Access your previously exported lead lists.</p>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-zinc-200 dark:border-zinc-700 border-t-electric-blue rounded-full animate-spin"></div>
    </div>

    <!-- Exports List -->
    <div v-else-if="exports.length > 0" class="space-y-4">
      <div v-for="exp in exports" :key="exp.id"
        class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:border-electric-blue/30 transition-colors">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-electric-blue/10 rounded-xl flex items-center justify-center">
            <FileText class="w-6 h-6 text-electric-blue" />
          </div>
          <div>
            <h3 class="font-bold text-zinc-900 dark:text-white">{{ exp.filename }}</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">
              {{ exp.lead_count }} leads
              <span v-if="exp.filters?.status && exp.filters.status !== 'All'" class="ml-2 px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-full">{{ exp.filters.status }}</span>
            </p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ formatDate(exp.created_at) }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
      <div class="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-200 dark:border-zinc-700">
        <DownloadCloud class="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
      </div>
      <h3 class="text-xl font-bold mb-2 text-zinc-900 dark:text-white">No Downloads Yet</h3>
      <p class="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">You haven't exported any lead lists from the Master Vault yet.</p>
      <button @click="$router.push('/dashboard')" class="px-6 py-3 bg-electric-blue hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,112,243,0.3)] cursor-pointer">
        Go to Master Vault
      </button>
    </div>

    <!-- Recent Activity Section -->
    <div v-if="activity.length > 0" class="mt-12">
      <h2 class="text-2xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
        <Activity class="w-6 h-6 text-electric-blue" />
        Recent Search Activity
      </h2>
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <table class="w-full text-sm text-left">
          <thead class="text-xs uppercase bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800/50">
            <tr>
              <th class="px-6 py-3 font-bold tracking-widest">Query</th>
              <th class="px-6 py-3 font-bold tracking-widest">Location</th>
              <th class="px-6 py-3 font-bold tracking-widest">Requested</th>
              <th class="px-6 py-3 font-bold tracking-widest">Found</th>
              <th class="px-6 py-3 font-bold tracking-widest">Status</th>
              <th class="px-6 py-3 font-bold tracking-widest">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            <tr v-for="a in activity" :key="a.id" class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <td class="px-6 py-4 font-medium text-zinc-900 dark:text-white">{{ a.search_query }}</td>
              <td class="px-6 py-4 text-zinc-600 dark:text-zinc-400">{{ a.search_location || '—' }}</td>
              <td class="px-6 py-4 text-zinc-600 dark:text-zinc-400">{{ a.leads_requested }}</td>
              <td class="px-6 py-4 text-zinc-600 dark:text-zinc-400">{{ a.leads_found || '—' }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-bold rounded-full"
                  :class="{
                    'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400': a.status === 'completed',
                    'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400': a.status === 'processing' || a.status === 'pending',
                    'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400': a.status === 'failed'
                  }">
                  {{ a.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-zinc-500 text-xs">{{ formatDate(a.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { DownloadCloud, FileText, Activity } from 'lucide-vue-next'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const exports = ref([])
const activity = ref([])
const isLoading = ref(true)

onMounted(async () => {
  if (!authStore.user) { isLoading.value = false; return }

  try {
    const [expRes, actRes] = await Promise.all([
      supabase.from('exports').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('activity').select('*').order('created_at', { ascending: false }).limit(20)
    ])
    
    if (expRes.data) exports.value = expRes.data
    if (actRes.data) activity.value = actRes.data
  } catch (err) {
    console.error('Failed to load downloads:', err)
  } finally {
    isLoading.value = false
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
