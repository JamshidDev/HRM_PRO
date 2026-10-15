import { inject, provide } from 'vue'
import { useAdContractStore } from '@/store/modules/index.js'

const AD_CONTRACT_FORM_STORE = Symbol('adContractFormStore')

// Forma shu store bilan ishlaydi: tabda — tahrir nusxasi, modalda — asosiy store.
export const provideAdContractFormStore = (store) => provide(AD_CONTRACT_FORM_STORE, store)

export const useAdContractFormStore = () =>
  inject(AD_CONTRACT_FORM_STORE, null) ?? useAdContractStore()
