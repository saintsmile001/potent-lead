<template>
  <div class="p-8 max-w-7xl mx-auto w-full h-full flex flex-col transition-colors duration-300">
    <div class="flex flex-col md:flex-row gap-4 md:justify-between items-start md:items-end mb-8">
      <div>
        <h1 class="text-3xl md:text-4xl font-black mb-2 text-zinc-900 dark:text-white">The Master Vault</h1>
        <p class="text-sm md:text-base text-zinc-500 dark:text-zinc-400">
          View, filter, and export your extracted leads.
          <span v-if="!leadStore.isLoading" class="text-electric-blue dark:text-cyber-lime font-bold ml-1 md:ml-2">{{ leadStore.leadCount }} total</span>
        </p>
      </div>
      <button @click="exportCSV" :disabled="filteredLeads.length === 0"
        class="w-full md:w-auto justify-center px-6 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl font-bold transition-all border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
        <DownloadCloud class="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        Export CSV
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="relative w-full md:flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input v-model="searchQuery" type="text" placeholder="Search within results..."
          class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all shadow-sm" />
      </div>
      <div class="flex w-full md:w-auto overflow-x-auto gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hide-scrollbar">
        <button v-for="filter in ['All', 'Vault', 'Fresh']" :key="filter" @click="statusFilter = filter"
          class="flex-1 whitespace-nowrap px-4 md:px-6 py-2 text-sm md:text-base rounded-lg font-medium transition-all cursor-pointer"
          :class="statusFilter === filter ? 'bg-electric-blue text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'">
          {{ filter }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="leadStore.isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-700 border-t-electric-blue rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-zinc-500 font-medium">Loading your leads...</p>
      </div>
    </div>

    <!-- Data Table -->
    <div v-else class="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead class="text-xs uppercase bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 sticky top-0 border-b border-zinc-200 dark:border-zinc-800/50 whitespace-nowrap">
            <tr>
              <th class="px-4 md:px-6 py-4 font-bold tracking-widest">Company</th>
              <th class="px-4 md:px-6 py-4 font-bold tracking-widest">Contact</th>
              <th class="px-4 md:px-6 py-4 font-bold tracking-widest">Website</th>
              <th class="px-4 md:px-6 py-4 font-bold tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            <tr v-for="lead in filteredLeads" :key="lead.id" class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <td class="px-4 md:px-6 py-4 font-medium text-zinc-900 dark:text-white whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                    {{ (lead.company_name || '?').charAt(0) }}
                  </div>
                  {{ lead.company_name || 'Unknown' }}
                </div>
              </td>
              <td class="px-4 md:px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-zinc-800 dark:text-zinc-200">{{ lead.email || '—' }}</span>
                  <span class="text-xs text-zinc-500">{{ lead.phone || 'No phone' }}</span>
                </div>
              </td>
              <td class="px-4 md:px-6 py-4 whitespace-nowrap">
                <a v-if="lead.website" :href="lead.website.startsWith('http') ? lead.website : 'https://' + lead.website" target="_blank" class="text-electric-blue hover:underline flex items-center gap-1">
                  {{ lead.website.replace(/^https?:\/\//, '') }}
                  <ExternalLink class="w-3 h-3" />
                </a>
                <span v-else class="text-zinc-400">—</span>
              </td>
              <td class="px-4 md:px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 w-fit"
                  :class="lead.status === 'Fresh' ? 'bg-cyber-lime/20 dark:bg-cyber-lime/10 text-green-700 dark:text-cyber-lime border-cyber-lime/30' : 'bg-electric-blue/10 text-electric-blue border-electric-blue/20'">
                  <div class="w-1.5 h-1.5 rounded-full" :class="lead.status === 'Fresh' ? 'bg-green-600 dark:bg-cyber-lime' : 'bg-electric-blue'"></div>
                  {{ lead.status }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredLeads.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-zinc-500">
                <div class="flex flex-col items-center gap-4">
                  <Search class="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                  <p class="font-bold text-zinc-700 dark:text-zinc-300 mb-1">No leads found</p>
                  <p class="text-sm">{{ leadStore.leadCount === 0 ? 'Run your first search to fill the Vault.' : 'Try adjusting your filter.' }}</p>
                  <button v-if="leadStore.leadCount === 0" @click="$router.push('/search')" class="px-6 py-3 bg-electric-blue hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer">
                    Start Searching
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Toast Notification -->
    <transition name="fade">
      <div v-if="toastMessage" class="fixed bottom-6 right-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-bold">
        <div class="w-2 h-2 rounded-full bg-cyber-lime animate-pulse"></div>
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, DownloadCloud, ExternalLink } from 'lucide-vue-next'
import { useLeadStore } from '../stores/leads'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/user'
import { supabase } from '../supabase'

const leadStore = useLeadStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const searchQuery = ref('')
const statusFilter = ref('All')
const toastMessage = ref('')

import { watch } from 'vue'

watch(() => userStore.creditBalance, (newVal, oldVal) => {
  if (newVal > oldVal && oldVal !== 0) {
    toastMessage.value = `Payment Verified! ${newVal - oldVal} credits added.`
    setTimeout(() => { toastMessage.value = '' }, 4000)
  }
})

onMounted(() => { leadStore.fetchLeads() })

const filteredLeads = computed(() => {
  return leadStore.leads.filter(lead => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch =
      (lead.company_name || '').toLowerCase().includes(q) ||
      (lead.email || '').toLowerCase().includes(q) ||
      (lead.website || '').toLowerCase().includes(q)
    const matchesStatus = statusFilter.value === 'All' || lead.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const exportCSV = async () => {
  const headers = ['Company Name', 'Email', 'Phone', 'Website', 'Status']
  const rows = filteredLeads.value.map(l => [l.company_name, l.email, l.phone, l.website, l.status].map(f => `"${(f || '').replace(/"/g, '""')}"`))
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const filename = `potent_leads_${new Date().toISOString().slice(0, 10)}.csv`
  link.setAttribute('href', URL.createObjectURL(blob))
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  if (authStore.user) {
    try {
      await supabase.from('exports').insert({
        user_id: authStore.user.id, filename,
        lead_count: filteredLeads.value.length,
        filters: { search: searchQuery.value, status: statusFilter.value }
      })
    } catch (err) { console.error('Failed to log export:', err) }
  }
}
</script>
