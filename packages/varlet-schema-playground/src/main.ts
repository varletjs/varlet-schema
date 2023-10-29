import App from './App.vue'
import Varlet, { Themes, StyleProvider } from '@varlet/ui'
import { createApp } from 'vue'

import '@varlet/ui/es/style'
import '@varlet/touch-emulator'

StyleProvider(Themes.dark)

createApp(App).use(Varlet).mount('#app')
