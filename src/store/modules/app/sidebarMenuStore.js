import { defineStore } from 'pinia'
import { useAppSetting } from '@/utils/index.js'

/**
 * Sidebar panelidagi (ochilgan modul menyusi) elementlarni PIN qilish va
 * drag-and-drop bilan tartibini o'zgartirish sozlamalari.
 *
 * localStorage'da FOYDALANUVCHI bo'yicha saqlanadi: bitta brauzerda ikki hisob
 * ishlatilsa, biri ikkinchisining tartibini ko'rib qolmaydi.
 *
 * Saqlanadigan shakl:
 *   { "<modulePath>": { pinned: [itemPath, ...], order: [itemPath, ...] } }
 *
 * MUHIM: faqat PATH saqlanadi, elementning o'zi emas. Ko'rinish har render'da
 * permissionlar bo'yicha qayta filtrlanadi (`SidebarContent.panelMenu`) — ya'ni
 * ruxsati olib qo'yilgan sahifa pinlangan bo'lsa ham menyuda chiqmaydi.
 */

const storageKey = () => {
  const userId = localStorage.getItem(useAppSetting.accountUserId) || 'guest'
  return `${useAppSetting.sidebarMenuPrefsKey}:${userId}`
}

/** Faqat string massivlarni qoldiradi — buzilgan/qo'lda tahrirlangan qiymatlar tashlanmaydi. */
const sanitizePaths = (value) =>
  Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.length) : []

const readPrefs = () => {
  try {
    const raw = localStorage.getItem(storageKey())
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.entries(parsed).reduce((acc, [modulePath, prefs]) => {
      acc[modulePath] = {
        pinned: sanitizePaths(prefs?.pinned),
        order: sanitizePaths(prefs?.order)
      }
      return acc
    }, {})
  } catch {
    // Buzilgan qiymat har yuklanishda exception bermasin.
    localStorage.removeItem(storageKey())
    return {}
  }
}

export const useSidebarMenuStore = defineStore('sidebarMenuStore', {
  state: () => ({
    prefs: {},
    // Chiqishdagi `getActivePinia().reset()` bu store'ni chetlab o'tadi; o'rniga
    // sidebar mount bo'lganda `load()` yangi foydalanuvchi kaliti bilan o'qiydi.
    skipReset: true
  }),

  getters: {
    modulePinned: (state) => (modulePath) => state.prefs[modulePath]?.pinned ?? [],
    moduleOrder: (state) => (modulePath) => state.prefs[modulePath]?.order ?? [],
    hasCustomization: (state) => (modulePath) => {
      const prefs = state.prefs[modulePath]
      return Boolean(prefs?.pinned?.length || prefs?.order?.length)
    }
  },

  actions: {
    load() {
      this.prefs = readPrefs()
    },

    _write() {
      try {
        localStorage.setItem(storageKey(), JSON.stringify(this.prefs))
      } catch {
        // Private mode / to'lgan storage — sozlama shu sessiyada ishlaydi, saqlanmaydi.
      }
    },

    setModulePrefs(modulePath, pinned, order) {
      if (!modulePath) return
      this.prefs = {
        ...this.prefs,
        [modulePath]: { pinned: sanitizePaths(pinned), order: sanitizePaths(order) }
      }
      this._write()
    },

    resetModule(modulePath) {
      if (!modulePath || !this.prefs[modulePath]) return
      const next = { ...this.prefs }
      delete next[modulePath]
      this.prefs = next
      this._write()
    }
  }
})
