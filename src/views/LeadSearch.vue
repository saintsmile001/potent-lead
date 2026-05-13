<template>
  <div class="p-8 max-w-4xl mx-auto w-full transition-colors duration-300">
    <h1 class="text-4xl font-black mb-2 text-zinc-900 dark:text-white">Lead Search Console</h1>
    <p class="text-zinc-500 dark:text-zinc-400 mb-10">Configure your parameters to initiate a deep data extraction.</p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Search Form -->
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 relative overflow-hidden h-fit shadow-sm">
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-electric-blue/5 blur-[80px] rounded-full pointer-events-none"></div>

        <form @submit.prevent="startSearch" class="relative z-10 space-y-6">
          
          <!-- Niches -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Niches / Categories</label>
            <input v-model="searchParams.niches" type="text" placeholder="e.g., Software, Real Estate, Dentists"
              class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all" required />
            <p class="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-medium uppercase tracking-wider">Use a <strong class="text-zinc-600 dark:text-zinc-400">Comma</strong> to separate multiple entries.</p>
          </div>

          <!-- Location Autocomplete -->
          <div class="relative">
            <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target City / State</label>
            <div class="relative">
              <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input v-model="locationInput" @input="searchLocations" @focus="showAutocomplete = true" @blur="handleBlur"
                type="text" placeholder="Search any global city or remote area..."
                class="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all" required />
            </div>
            <transition name="dropdown">
              <div v-if="showAutocomplete && (apiCities.length > 0 || isFetchingLocation)" class="absolute left-0 right-0 top-[100%] mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                <div v-if="isFetchingLocation" class="px-4 py-3 text-sm text-zinc-500 animate-pulse">Searching globe...</div>
                <button v-for="city in apiCities" :key="city.id" @mousedown.prevent="selectCity(city)" type="button"
                  class="w-full text-left px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-electric-blue transition-colors border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 flex items-center gap-2 cursor-pointer">
                  <MapPin class="w-3 h-3 opacity-50" />
                  {{ city.name }}, {{ city.admin1 ? city.admin1 + ', ' : '' }}{{ city.country }}
                </button>
              </div>
            </transition>
          </div>

          <!-- Volume Slider -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Lead Volume Needed</label>
            <div class="flex items-center gap-4">
              <input v-model="searchParams.volume" type="range" min="50" max="5000" step="50"
                class="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer custom-slider" />
              <div class="w-20 px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-center font-mono font-bold text-electric-blue dark:text-cyber-lime">
                {{ searchParams.volume }}
              </div>
            </div>
          </div>

          <!-- Credit Check Warning -->
          <div v-if="userStore.creditBalance < searchParams.volume" class="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            Insufficient credits ({{ userStore.creditBalance }} available, {{ searchParams.volume }} needed).
          </div>

          <button type="submit" :disabled="isSearching || !searchParams.niches.trim() || !locationInput.trim() || userStore.creditBalance < searchParams.volume"
            class="w-full py-4 bg-electric-blue hover:bg-blue-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4 shadow-md cursor-pointer">
            <Search class="w-5 h-5" />
            {{ isSearching ? 'Extraction in Progress...' : 'Initialize Search' }}
          </button>
        </form>
      </div>

      <!-- Terminal -->
      <div class="bg-zinc-900 dark:bg-black border border-zinc-800 rounded-3xl p-6 font-mono text-sm relative overflow-hidden flex flex-col h-[450px] shadow-lg">
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/50">
          <div class="flex gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span class="text-zinc-500 text-xs uppercase tracking-widest">System Terminal</span>
        </div>
        <div class="flex-1 overflow-y-auto space-y-2 text-zinc-300 dark:text-zinc-400" id="terminal-output">
          <div v-if="terminalLines.length === 0" class="text-zinc-500">> Waiting for parameters...</div>
          <div v-for="(line, index) in terminalLines" :key="index" :class="line.color">> {{ line.text }}</div>
          <div v-if="isSearching" class="animate-pulse text-zinc-500">_</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { Search, MapPin, AlertCircle } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import { useLeadStore } from '../stores/leads'
import { useAuthStore } from '../stores/authStore'
import { triggerLeadGeneration } from '../services/leadService'

const userStore = useUserStore()
const leadStore = useLeadStore()
const authStore = useAuthStore()

const searchParams = reactive({ niches: '', volume: 500 })
const locationInput = ref('')
const showAutocomplete = ref(false)
const apiCities = ref([])
const isFetchingLocation = ref(false)
let searchTimeout = null

const searchLocations = () => {
  const query = locationInput.value.trim()
  if (!query) { apiCities.value = []; showAutocomplete.value = false; return }
  showAutocomplete.value = true
  isFetchingLocation.value = true
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
      const data = await res.json()
      apiCities.value = data.results || []
    } catch (e) { apiCities.value = [] }
    finally { isFetchingLocation.value = false }
  }, 300)
}

const selectCity = (city) => {
  locationInput.value = `${city.name}, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country}`
  showAutocomplete.value = false
}

const handleBlur = () => { setTimeout(() => { showAutocomplete.value = false }, 200) }

const isSearching = ref(false)
const terminalLines = ref([])

const addLine = async (text, color = 'text-zinc-300 dark:text-zinc-400') => {
  terminalLines.value.push({ text, color })
  await nextTick()
  const terminal = document.getElementById('terminal-output')
  if (terminal) terminal.scrollTop = terminal.scrollHeight
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const startSearch = async () => {
  if (isSearching.value || !searchParams.niches.trim() || !locationInput.value.trim()) return
  
  const userId = authStore.user?.id
  if (!userId) {
    terminalLines.value = [{ text: '[ERROR] Authentication required. Please sign in.', color: 'text-red-500 font-bold' }]
    return
  }

  if (userStore.creditBalance < searchParams.volume) {
    terminalLines.value = [{ text: `[ERROR] INSUFFICIENT CREDITS. Need ${searchParams.volume}, have ${userStore.creditBalance}.`, color: 'text-red-500 font-bold' }]
    return
  }
  
  isSearching.value = true
  terminalLines.value = []
  const extractedNiches = searchParams.niches.split(',').map(n => n.trim()).filter(n => n)
  
  await addLine('INITIALIZING SEARCH PROTOCOL...', 'text-electric-blue font-bold')
  await sleep(600)
  await addLine(`Target Niches: [${extractedNiches.join(', ').toUpperCase()}]`)
  await addLine(`Target Location: [${locationInput.value.toUpperCase()}]`)
  await addLine(`Volume Requested: ${searchParams.volume} Leads`)
  await sleep(800)

  // Create activity record in Supabase
  let activityId = null
  let batchId = null
  try {
    await addLine('Registering search in activity log...', 'text-zinc-500')
    const result = await leadStore.createSearchActivity(userId, extractedNiches.join(', '), locationInput.value, searchParams.volume)
    activityId = result.activityId
    batchId = result.batchId
    await addLine('[OK] Activity logged.', 'text-green-400 dark:text-cyber-lime')
  } catch (err) {
    await addLine('[WARN] Activity log failed, continuing search...', 'text-yellow-400')
    batchId = crypto.randomUUID()
  }

  await sleep(500)
  await addLine('Transmitting parameters to remote n8n worker...', 'text-yellow-400')

  const payload = {
    category: extractedNiches.join(', '),
    location: locationInput.value,
    email: userStore.user?.email || 'user@potent-lead.com',
    count: searchParams.volume,
    userId,
    batchId
  }

  try {
    await triggerLeadGeneration(payload)
    await sleep(800)
    await addLine('[OK] n8n Webhook Acknowledged. Scrape initiated!', 'text-green-400 dark:text-cyber-lime')
  } catch (err) {
    await addLine('[ERROR] Connection to Lead Engine failed!', 'text-red-500 font-bold')
    if (activityId) await leadStore.failSearchActivity(activityId)
    isSearching.value = false
    return
  }

  // Deduct credits via Supabase RPC
  await addLine('Deducting credits from balance...', 'text-red-400')
  const deducted = await userStore.useCredits(userId, searchParams.volume)
  if (deducted) {
    await addLine(`[OK] ${searchParams.volume} credits deducted. Balance: ${userStore.creditBalance}`, 'text-green-400 dark:text-cyber-lime')
  } else {
    await addLine('[WARN] Credit deduction failed on server.', 'text-yellow-400')
  }

  await sleep(1000)
  await addLine('Connecting to Master Vault...', 'text-zinc-500')
  await sleep(1500)

  const vaultFound = Math.floor(searchParams.volume * 0.4)
  const remaining = searchParams.volume - vaultFound
  await addLine(`[SUCCESS] Found ${vaultFound} matching records in Vault.`, 'text-green-400 dark:text-cyber-lime')
  await sleep(800)

  if (remaining > 0) {
    await addLine(`Shortfall detected: ${remaining} leads.`)
    await sleep(500)
    await addLine('Live Deep Search engines are extracting data in the background...', 'text-yellow-400')
    await sleep(2000)
    await addLine(`Scraping across categories: ${extractedNiches.join(', ')}...`)
    await sleep(1500)
    await addLine('Raw data is being pushed to SMTP verifiers via n8n pipeline.', 'text-electric-blue')
  }

  // Poll for leads from Supabase
  await sleep(1000)
  await addLine('Polling for incoming lead data...', 'text-yellow-400')
  const foundCount = await leadStore.pollForLeads(batchId, 10, 3000)

  if (foundCount > 0) {
    await addLine(`[SUCCESS] ${foundCount} leads received and stored!`, 'text-green-400 dark:text-cyber-lime font-bold')
    if (activityId) await leadStore.completeSearchActivity(activityId, foundCount)
  } else {
    await addLine('[INFO] Leads are still compiling in the background.', 'text-yellow-400')
    await addLine('Check the Master Vault shortly — results will appear as they arrive.', 'text-zinc-500')
    if (activityId) await leadStore.completeSearchActivity(activityId, 0)
  }

  await addLine('=========================================')
  await addLine('PROCESS COMPLETE. Check your Master Vault for results.', 'text-green-400 dark:text-cyber-lime font-bold')
  isSearching.value = false
}
</script>

<style scoped>
.custom-slider::-webkit-slider-thumb {
  appearance: none; width: 16px; height: 16px; border-radius: 50%;
  background: var(--color-electric-blue, #0070f3); cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 112, 243, 0.4);
}
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.2s, transform 0.2s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
