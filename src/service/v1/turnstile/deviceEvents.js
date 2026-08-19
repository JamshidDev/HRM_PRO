import axios from '@/service/index.js'

// HRM'siz qo'shilgan xodimlarning turniketdan o'tishlari (backend: device-events).
const _index = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/device-events`, {
    params: payload?.params
  })
}

// Rasm backend proxy orqali keladi (HCP `picUri` — `Vsm://` sxemasi, POST + HMAC
// imzo talab qiladi). Endpoint Bearer token so'ragani uchun `<img src>` bilan
// to'g'ridan-to'g'ri ochib bo'lmaydi — blob qilib olib, objectURL yasaymiz.
const _photo = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/device-events/${payload.id}/photo`, {
    responseType: 'blob'
  })
}

const _resolve = async (payload) => {
  return await axios.post(
    `/v1/turnstile/hik-central/device-events/${payload.id}/resolve`,
    payload.data
  )
}

// Shaxsni HCP'dan o'chirish — u BARCHA qurilmalardan tushadi.
const _removePerson = async (payload) => {
  return await axios.post(
    `/v1/turnstile/hik-central/device-events/${payload.id}/remove-person`,
    {}
  )
}

const _sync = async (payload) => {
  return await axios.post(`/v1/turnstile/hik-central/device-events/sync`, payload?.data ?? {})
}

export default { _index, _photo, _resolve, _removePerson, _sync }
