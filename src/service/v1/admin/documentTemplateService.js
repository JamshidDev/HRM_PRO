import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/admin/document-templates`, { params: payload?.params })
}

const _variables = async (payload) => {
  return await axios.get(`/v1/admin/document-templates/variables`, { params: payload.params })
}

/**
 * Muharrir uchun xom DOCX baytlari. `silentError`: xato javobi ham arraybuffer
 * bo'lib keladi, interceptor undan xabarni o'qiy olmaydi — store dekod qiladi.
 * Versiya tokeni javob header'ida: `x-template-version`.
 */
const _content = async (payload) => {
  return await axios.get(`/v1/admin/document-templates/content`, {
    params: payload.params,
    responseType: 'arraybuffer',
    silentError: true
  })
}

// Tahrirlangan shablonni GLOBAL saqlash (multipart: file, category, type, version).
const _save = async (payload) => {
  return await axios.post(`/v1/admin/document-templates/save`, payload.data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Standart (git'dagi) shablonga qaytarish — global override o'chadi.
const _reset = async (payload) => {
  return await axios.delete(`/v1/admin/document-templates/${payload.category}/${payload.type}`)
}

export default {
  _index,
  _variables,
  _content,
  _save,
  _reset
}
