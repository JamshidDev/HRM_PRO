import './style.css'
import './assets/index.scss'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n/index.js'
import pinia from './store/index.js'
import ApiService from '@/service/ApiService.js'
import naive from 'naive-ui'
import mask from './directives/mask.js'
import VueSignature from 'vue-signature-pad'
import inputFormatter from '@/plugins/inputFormatter.js'
import dateMaskPlugin from '@/plugins/dateMaskPlugin.js'
import FlyUploadPlugin from '@/plugins/flyUploadPlugin.js'
import { useAccountStore } from '@/store/modules/index.js'
import { RecycleScroller } from 'vue3-virtual-scroller'
import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css'

const app = createApp(App)
const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

app.use(VueSignature)
app.use(naive)
app.use(inputFormatter)
app.use(dateMaskPlugin)
app.use(router)
app.use(pinia)

app.component('RecycleScroller', RecycleScroller)

const store = useAccountStore()

app.use(FlyUploadPlugin, {
  store: store,
  storeAction: 'incrementUnReadCount'
})

// Barcha menyular permission'siz ochiladi — faqat LOCAL mode'da (npm run local).
// Dev va prod serverlarda menyular permission bo'yicha ishlaydi.
if (import.meta.env.MODE === 'localhost') {
  store.isModeDev = true
}

window.$ApiService = ApiService

app.directive('mask', mask)

app.use(i18n)

app.mount('#app')
