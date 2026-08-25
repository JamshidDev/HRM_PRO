import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/chat/news`, { params: payload.params })
}

// Yangiliklarning FOYDALANUVCHI tomoni (mobil API): server faqat chop
// etilganlarini qaytaradi va matnni `Accept-Language` bo'yicha tanlaydi —
// `_index` esa CMS ro'yxati (qoralamalar bilan, admin ruxsati talab qilinadi).
const _publicIndex = async (payload) => {
  return await axios.get(`/v1/news`, {
    params: payload?.params,
    // Bosh sahifada xato bo'lsa toast chiqmasligi kerak — blok jimgina
    // yashiriladi (`src/service/index.js` interceptori tekshiradi).
    silentError: payload?.silentError
  })
}

const _show = async (payload) => {
  return await axios.get(`/v1/chat/news/${payload.id}`)
}

const _create = async (payload) => {
  return await axios.post(`/v1/chat/news`, payload.data)
}

const _update = async (payload) => {
  return await axios.post(`/v1/chat/news/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/chat/news/${payload.id}`)
}

const _update_translation = async (payload) => {
  return await axios.post(`/v1/chat/translations`, payload.data)
}

const _remove_media = async (payload) => {
  return await axios.delete(`/v1/chat/media/${payload.id}`)
}

const _create_media = async (payload) => {
  return await axios.post(`/v1/chat/media`, payload.data)
}

export default {
  _index,
  _publicIndex,
  _show,
  _create,
  _update_translation,
  _delete,
  _remove_media,
  _create_media,
  _update
}
