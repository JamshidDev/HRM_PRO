import axios from '@/service/index.js'

// Xodimning til sertifikatlari (IELTS, HSK, DELF...). NestJS-only modul.
const _index = async (payload) => {
  return await axios.get(`/v1/hr/language-certificates`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/hr/language-certificates`, payload.data)
}

// `_method: 'PUT'` params orqali — multipart bilan PUT yuborish uchun
// (worker-languages bilan bir xil uslub).
const _update = async (payload) => {
  return await axios.post(`/v1/hr/language-certificates/${payload.id}`, payload.data, {
    params: payload.params
  })
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/language-certificates/${payload.id}`)
}

// Sertifikat turlari — har birida `language_id` bor (select kaskad filtri uchun).
const _types = async (payload) => {
  return await axios.get(`/v1/hr/enums/language-certificate-types`, {
    params: payload?.params
  })
}

// CEFR darajalari (A1–C2).
const _cefrLevels = async (payload) => {
  return await axios.get(`/v1/hr/enums/cefr-levels`, { params: payload?.params })
}

export default {
  _index,
  _create,
  _update,
  _delete,
  _types,
  _cefrLevels
}
