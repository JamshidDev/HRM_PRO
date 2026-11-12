/*
 * Tanlov panelidagi tez tur chiplari (K, T, D …).
 *
 * Standart to'plam — `DEFAULT_QUICK_TYPE_IDS` (ID'lar `timesheetGrid.js` dagi izohlarda).
 * Foydalanuvchi «Tabel bo'yicha ma'lumot» oynasida o'zgartiradi; tanlovi brauzerda
 * (`localStorage`) saqlanadi — maxfiy ma'lumot emas, faqat ko'rinish sozlamasi.
 */
import { computed, ref } from 'vue'

export const DEFAULT_QUICK_TYPE_IDS = [1, 2, 33, 14, 25, 10]
// Panel bir qatorga sig'ishi uchun chegara
export const MAX_QUICK_TYPES = 8
const STORAGE_KEY = 'timesheet.quickTypes'

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(v) && v.every(Number.isInteger) ? v.slice(0, MAX_QUICK_TYPES) : null
  } catch {
    return null
  }
}

const save = () => {
  try {
    if (isDefaultQuickTypes.value) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(quickTypeIds.value))
  } catch {
    // brauzer saqlashga ruxsat bermasa — tanlov faqat shu seans uchun qoladi
  }
}

// Modul darajasida — panel va «Ma'lumot» oynasi bitta qiymatni ko'radi
export const quickTypeIds = ref(read() ?? [...DEFAULT_QUICK_TYPE_IDS])

export const isDefaultQuickTypes = computed(
  () =>
    quickTypeIds.value.length === DEFAULT_QUICK_TYPE_IDS.length &&
    quickTypeIds.value.every((id, i) => id === DEFAULT_QUICK_TYPE_IDS[i])
)

export const toggleQuickType = (id) => {
  const ids = quickTypeIds.value
  if (ids.includes(id)) quickTypeIds.value = ids.filter((v) => v !== id)
  else if (ids.length < MAX_QUICK_TYPES) quickTypeIds.value = [...ids, id]
  else return
  save()
}

export const resetQuickTypes = () => {
  quickTypeIds.value = [...DEFAULT_QUICK_TYPE_IDS]
  save()
}
