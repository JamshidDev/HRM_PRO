
import "./assets/index.scss"
import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import {createPinia} from "pinia"
import i18n from "./i18n/index.js"

import naive from 'naive-ui'
const app = createApp(App);
const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)
const pinia =  createPinia()

app.use(i18n)
app.use(naive)
app.use(router)
app.use(pinia)
app.mount('#app')