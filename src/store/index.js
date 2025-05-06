import { createPinia } from 'pinia';
import {resetStoresPlugin} from "@/store/plugin/resetStore.js"

const pinia = createPinia()
pinia.use(resetStoresPlugin)

export default pinia;