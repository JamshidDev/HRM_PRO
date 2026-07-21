import axios from '@/service/index.js'

// Xodim lavozimi guvohnomasi (udostoverenie). NestJS-only modul.
// Ro'yxat — xodimning barcha korxonadagi guvohnomasi; tahrir faqat o'z org (backend).
const _index = async (payload) => {
  return await axios.get(`/v1/hr/worker-position-certificates`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/hr/worker-position-certificates`, payload.data)
}

// `_method: 'PUT'` params orqali — multipart bilan PUT yuborish uchun
// (NestJS method-override middleware POST'ni PUT'ga aylantiradi).
const _update = async (payload) => {
  return await axios.post(`/v1/hr/worker-position-certificates/${payload.id}`, payload.data, {
    params: payload.params
  })
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/worker-position-certificates/${payload.id}`)
}

export default {
  _index,
  _create,
  _update,
  _delete
}
