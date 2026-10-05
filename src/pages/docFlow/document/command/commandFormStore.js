import { inject, provide } from 'vue'
import { useCommandStore } from '@/store/modules/index.js'

const COMMAND_FORM_STORE = Symbol('commandFormStore')

// Forma ichidagi komponentlar shu store bilan ishlaydi: tabda — tahrir nusxasi, modalda — asosiy store.
export const provideCommandFormStore = (store) => provide(COMMAND_FORM_STORE, store)

export const useCommandFormStore = () => inject(COMMAND_FORM_STORE, null) ?? useCommandStore()
