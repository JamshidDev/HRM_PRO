import axios from '@/service/index.js'

// Guvohnomalar RO'YXATI (HR moduli, alohida sahifa) — NestJS-only.
//
// `workerPositionCertificateService` dan FARQI: u xodim profilидagi tab uchun
// (bitta xodim `uuid` bo'yicha CRUD), bu esa ro'yxat sahifasi uchun:
// shtatdagi xodimlar + har biriga OXIRGI guvohnoma (yo'q bo'lsa `null`).
const _index = async (payload) => {
  return await axios.get(`/v1/hr/worker-certificates`, { params: payload.params })
}

export default {
  _index
}
