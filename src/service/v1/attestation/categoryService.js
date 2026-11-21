import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/exam/categories`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/exam/categories`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/exam/categories/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/exam/categories/${payload.id}`)
}
const _show = async (payload) => {
  return await axios.get(`/v1/exam/categories/${payload.id}`)
}

const _template = async () => {
  return await axios.get(`/v1/exam/categories/template`, { responseType: 'blob' })
}

// preview=1 — faqat o'qib qaytaradi, bazaga yozmaydi.
const _importTemplate = async (payload) => {
  return await axios.post(`/v1/exam/categories/${payload.id}/import-template`, payload.data, {
    params: payload.preview ? { preview: 1 } : undefined
  })
}

const _clear = async (payload) => {
  return await axios.get(`/v1/exam/categories/${payload.id}/clear`, { params: payload?.params })
}

export default {
  _index,
  _create,
  _update,
  _delete,
  _clear,
  _show,
  _template,
  _importTemplate
}
