import { defineStore } from 'pinia'
import { useAppSetting } from '@/utils/index.js'

/**
 * Sidebar panelidagi (ochilgan modul menyusi) elementlarni PIN qilish va
 * drag-and-drop bilan tartibini o'zgartirish sozlamalari.
 *
 * localStorage'da FOYDALANUVCHI + ROL bo'yicha saqlanadi:
 *   - bitta brauzerda ikki hisob ishlatilsa, biri ikkinchisining tartibini
 *     ko'rib qolmaydi;
 *   - bitta foydalanuvchi bir nechta rol (yoki tashkilot) bilan ishlasa, har
 *     rolning menyusi boshqacha bo'lgani uchun tartib ham alohida saqlanadi.
 *
 * Kalit: `app-sidebar-menu:<userId>:<roleId>-<orgId>`
 *
 * Saqlanadigan shakl:
 *   { "<modulePath>": { pinned: [itemPath, ...], order: [itemPath, ...] } }
 *
 * MUHIM: faqat PATH saqlanadi, elementning o'zi emas. Ko'rinish har render'da
 * permissionlar bo'yicha qayta filtrlanadi (`SidebarContent.panelMenu`) — ya'ni
 * ruxsati olib qo'yilgan sahifa pinlangan bo'lsa ham menyuda chiqmaydi.
 */

/**
 * Joriy scope: foydalanuvchi + rol. Rol scope'ini `accountStore._index()` yozadi
 * va chiqishda o'chiradi; profil hali kelmagan bo'lsa `norole` ishlatiladi — bu
 * ham foydalanuvchining O'Z bo'lagi, ya'ni boshqa rolga sizib o'tmaydi.
 */
const currentScope = () => {
  const userId = localStorage.getItem(useAppSetting.accountUserId) || 'guest'
  const roleScope = localStorage.getItem(useAppSetting.accountRoleScopeKey) || 'norole'
  return `${userId}:${roleScope}`
}

const storageKey = (scope) => `${useAppSetting.sidebarMenuPrefsKey}:${scope}`

/** Faqat string massivlarni qoldiradi — buzilgan/qo'lda tahrirlangan qiymatlar tashlanmaydi. */
const sanitizePaths = (value) =>
  Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.length) : []

const readPrefs = (scope) => {
  try {
    const raw = localStorage.getItem(storageKey(scope))
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
    localStorage.removeItem(storageKey(scope))
    return {}
  }
}

export const useSidebarMenuStore = defineStore('sidebarMenuStore', {
  state: () => ({
    prefs: {},
    // Xotiradagi `prefs` qaysi (foydalanuvchi + rol) uchun o'qilgani. Yozishdan
    // oldin joriy scope bilan solishtiriladi — rol almashgan bo'lsa, eski
    // rolning tartibi yangi rol kalitiga yozilib ketmaydi.
    scope: null,
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
      this.scope = currentScope()
      this.prefs = readPrefs(this.scope)
    },

    /**
     * Foydalanuvchi yoki rol almashgan bo'lsa qayta o'qiydi. Sidebar mount
     * bo'lmasdan ham rol almashishi mumkin (`_changeRole` faqat `Home` ga
     * yo'naltiradi), shuning uchun har yozishdan oldin ham chaqiriladi.
     */
    syncScope() {
      if (this.scope !== currentScope()) this.load()
    },

    _write() {
      try {
        localStorage.setItem(storageKey(this.scope), JSON.stringify(this.prefs))
      } catch {
        // Private mode / to'lgan storage — sozlama shu sessiyada ishlaydi, saqlanmaydi.
      }
    },

    setModulePrefs(modulePath, pinned, order) {
      if (!modulePath) return
      this.syncScope()
      this.prefs = {
        ...this.prefs,
        [modulePath]: { pinned: sanitizePaths(pinned), order: sanitizePaths(order) }
      }
      this._write()
    },

    resetModule(modulePath) {
      this.syncScope()
      if (!modulePath || !this.prefs[modulePath]) return
      const next = { ...this.prefs }
      delete next[modulePath]
      this.prefs = next
      this._write()
    }
  }
})
