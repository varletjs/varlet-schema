import App from './App.vue'
import { createApp } from 'vue'
import Varlet from '@varlet/ui'

import '@varlet/touch-emulator'

createApp(App).use(Varlet).mount('#app')
