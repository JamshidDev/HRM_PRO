import axios from '@/service/index.js'

// KPI ko'rsatgichlar (HR moduli) — NestJS-only.
// Hozircha faqat xodimlar ro'yxati; ko'rsatkichlarning O'ZI boshqa tizimdan keladi,
// "ko'rish" modali uchun endpoint integratsiya manzili berilgach qo'shiladi.
const _index = async (payload) => {
  return await axios.get(`/v1/hr/kpi/workers`, { params: payload.params })
}

export default {
  _index
}
