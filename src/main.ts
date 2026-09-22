import './theme/main.css'

import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'

registerSW({ immediate: true })

createApp(App).use(createPinia()).use(router).mount('#app')
