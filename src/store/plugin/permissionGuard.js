import i18n from '@/i18n/index.js'
import { ENFORCED } from '@/utils/permissionGroups.js'
import { STORE_PERMISSIONS } from '@/store/plugin/permissionMap.js'
import { useAccountStore } from '@/store/modules/app/accountStore.js'

/**
 * Mutatsiya amallarini store darajasida qo'riqlaydigan pinia plagini.
 *
 * Nima uchun komponentda emas: audit ko'rsatdiki 362 ta mutatsiya handleridan
 * 206 tasida hech qanday ruxsat tekshiruvi yo'q edi. Ularni 105 katalogda
 * birma-bir tuzatish — ko'rib chiqib bo'lmaydigan diff va har bir unutilgan joy
 * jimgina teshik. Store esa BARCHA chaqiruv yo'llari kesishadigan yagona nuqta:
 * dropdown, kontekst-menyu, klaviatura yoki konsoldan dasturiy chaqiruv — hammasi
 * shu yerdan o'tadi.
 *
 * Bu UX qatlami, xavfsizlik chegarasi EMAS — haqiqiy himoya backend'da.
 */

const ACTION_BY_METHOD = {
  _create: 'write',
  _update: 'write',
  _delete: 'delete'
}

export function permissionGuardPlugin({ store }) {
  const prefix = STORE_PERMISSIONS[store.$id]
  // Xaritada yo'q store cheklanmaydi — unutilgan yozuv sahifani buzmasin (fail-open).
  if (!prefix) return

  for (const [method, action] of Object.entries(ACTION_BY_METHOD)) {
    const original = store[method]
    if (typeof original !== 'function') continue

    const slug = `${prefix}-${action}`
    // Frontend backend'dan qattiqroq bo'lmasin: faqat u haqiqatan
    // enforce qiladigan amallar tekshiriladi.
    if (!ENFORCED.has(slug)) continue

    store[method] = (...args) => {
      // `useAccountStore` shu yerda — chaqiruv paytida — olinadi: plagin store
      // yaratilishida ishlaydi va o'sha paytda pinia hali to'liq tayyor bo'lmasligi
      // mumkin (accountStore ↔ router aylanma bog'liqligi ham bor).
      const accStore = useAccountStore()
      if (!accStore.checkPermission(slug)) {
        window.$Toast?.warning(i18n.global.t('message.noPermission'))
        // Chaqiruvchilar odatda `.then()`/`await` qiladi — Promise qaytaramiz.
        return Promise.resolve()
      }
      return original(...args)
    }
  }
}
