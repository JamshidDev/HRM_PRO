import { createPinia } from 'pinia'
import { resetStoresPlugin } from '@/store/plugin/resetStore.js'
import { permissionGuardPlugin } from '@/store/plugin/permissionGuard.js'

const pinia = createPinia()
pinia.use(resetStoresPlugin)
pinia.use(permissionGuardPlugin)

export default pinia
