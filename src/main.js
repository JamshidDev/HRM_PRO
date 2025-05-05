import './style.css'
import "./assets/index.scss"
import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import {createPinia} from "pinia"
import i18n from "./i18n/index.js"
import ApiService from "@/service/ApiService.js";
import naive from 'naive-ui'
import mask from "./directives/mask.js"
import VueSignature from "vue-signature-pad"
import inputFormatter from "@/plugins/inputFormatter.js"
import dateMaskPlugin from "@/plugins/dateMaskPlugin.js"
import '@wangeditor/editor/dist/css/style.css';

const app = createApp(App);
const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)




const pinia =  createPinia()

app.use(VueSignature)
app.use(naive)
app.use(inputFormatter)
app.use(dateMaskPlugin)
app.use(router)
app.use(pinia)
window.$ApiService = ApiService

app.directive('mask',mask)

app.use(i18n)

app.mount('#app')
