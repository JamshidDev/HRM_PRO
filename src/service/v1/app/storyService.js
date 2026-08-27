import axios from '@/service/index.js'

// Story'larning FOYDALANUVCHI tomoni (mobil API): server allaqachon chop
// etilganlarini filtrlaydi, matnlarni `Accept-Language` bo'yicha tanlaydi va
// har bir story uchun `is_seen` qaytaradi.
// Admin CRUD esa alohida: `service/v1/admin/mobileStoryService.js`.
const _index = async (payload) => {
  return await axios.get(`/v1/mobile/stories`, {
    // Bosh sahifada ruxsat/xato bo'lsa toast chiqmasligi kerak — blok
    // jimgina yashiriladi (`src/service/index.js` interceptori tekshiradi).
    silentError: payload?.silentError
  })
}

// Ko'rilgan deb belgilash — idempotent (`{ success, already_seen }`).
const _seen = async (payload) => {
  return await axios.post(`/v1/mobile/stories/${payload.id}/seen`, null, {
    silentError: true
  })
}

export default {
  _index,
  _seen
}
