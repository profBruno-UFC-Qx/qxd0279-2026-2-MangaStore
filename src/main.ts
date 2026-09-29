import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import langPtBR from 'quasar/lang/pt-BR'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './css/app.css'
import { router } from './router'
import App from './App.vue'

const app = createApp(App)
app.use(Quasar, {
  plugins: { Notify, Dialog, Loading },
  lang: langPtBR,
  config: { dark: 'auto' },
})
app.use(createPinia())
app.use(router)
app.mount('#app')
