import axios from '@/service/index.js'

// KPI ko'rsatgichlar (HR moduli) — NestJS-only.
// Hozircha faqat xodimlar ro'yxati; ko'rsatkichlarning O'ZI boshqa tizimdan keladi,
// "ko'rish" modali uchun endpoint integratsiya manzili berilgach qo'shiladi.
const _index = async (payload) => {
  return await axios.get(`/v1/hr/kpi/workers`, { params: payload.params })
}

// Bitta xodimning KPI ma'lumoti. Backend tashqi KPI tizimiga (kpi.das-uty.uz)
// server-to-server chiqadi — kalitlar brauzerga TUSHMAYDI.
// 🔑 Kalit — `worker_position_id` (KPI tomonida `eUserId`), xodim id'si EMAS.
const _employee = async (payload) => {
  return await axios.get(`/v1/hr/kpi/positions/${payload.id}`, {
    params: payload?.params
  })
}

export default {
  _index,
  _employee
}
