import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useTheme } from './composables/useTheme'

// Initialize theme before mounting app
const { initTheme } = useTheme()
initTheme()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})
