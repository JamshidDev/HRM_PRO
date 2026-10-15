import { inject, provide } from 'vue'
import { useContractStore } from '@/store/modules/index.js'

const CONTRACT_FORM_STORE = Symbol('contractFormStore')

// Forma qismlari shu store bilan ishlaydi: tabda — tahrir nusxasi, modalda — asosiy store.
export const provideContractFormStore = (store) => provide(CONTRACT_FORM_STORE, store)

export const useContractFormStore = () => inject(CONTRACT_FORM_STORE, null) ?? useContractStore()
