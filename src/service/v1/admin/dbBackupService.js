import axios from '@/service/index.js'

// Baza zaxira nusxalari — FAQAT KO'RISH.
// `download` endpointi backendda bor, lekin ataylab ishlatilmaydi: to'liq dump
// ~90k xodimning shaxsiy ma'lumoti, uni brauzer orqali chiqarish xavfli
// (qarang super-power/db-backup.md).
const _index = async (payload) => {
  return await axios.get(`/v1/admin/db-backups`, { params: payload?.params })
}

export default {
  _index
}
