import axios from '@/service/index.js'

// O'zgarishlar tarixi (audit). Butun tizim uchun BITTA endpoint to'plami —
// har CRUD page o'ziga `trigger_name` bilan murojaat qiladi.
//
// `trigger_name` MAJBURIY: backend har so'rovda o'sha page'ning o'z
// permission'ini tekshiradi, ya'ni boshqa page ma'lumotini ko'rish server
// tomonda bloklanadi (UI'dagi disable — faqat qulaylik).

const _index = async (payload) => {
  return await axios.get(`/v1/audit`, { params: payload.params })
}

// Filter dropdownlari: statuslar (count bilan), o'zgarish qilgan foydalanuvchilar,
// mavjud sana oralig'i. `users` ro'yxati jurnalning o'zidan chiqadi.
const _meta = async (payload) => {
  return await axios.get(`/v1/audit/meta`, { params: payload.params })
}

// Kartochka maydonlari ta'rifi (kalit, yorliq, tip, tartib) — ikkala kartochka
// bir xil tartibda chiqishi uchun.
const _fields = async (payload) => {
  return await axios.get(`/v1/audit/fields`, { params: payload.params })
}

export default {
  _index,
  _meta,
  _fields
}
