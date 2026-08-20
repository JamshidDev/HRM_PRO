import axios from '@/service/index.js'

const _confirmationDocument = async (payload) => {
  return await axios.post(`/v1/confirmation/document/signature`, payload.data, {
    silentError: payload.silentError
  })
}
const _documentBase64 = async (payload) => {
  return await axios.get(`/v1/confirmation/document/base64`, { params: payload.params })
}
const _confirmationContract = async (payload) => {
  return await axios.get(`/v1/confirmation/contracts`, { params: payload.params })
}
const _confirmationCommand = async (payload) => {
  return await axios.get(`/v1/confirmation/commands`, { params: payload.params })
}
const _confirmationAdContract = async (payload) => {
  return await axios.get(`/v1/confirmation/contract-additional`, { params: payload.params })
}
const _addQRCode = async (payload) => {
  return await axios.get(`/v1/confirmation/document/base64`, { params: payload.params })
}
const _openDocument = async (payload) => {
  return await axios.get(`/v1/document/show`, { params: payload.params })
}
const _history = async (payload) => {
  return await axios.get(`/v1/document/history`, { params: payload.params })
}
const _generateLink = async (payload) => {
  return await axios.get(`/v1/document/generate-url`, { params: payload.params })
}

const _signature = async (payload) => {
  return await axios.post(`/v1/document/signature`, payload.data, { params: payload.params })
}
const _confirmationTimesheet = async (payload) => {
  return await axios.get(`/v1/confirmation/timesheet`, { params: payload.params })
}

/**
 * Tahrirlash v2 (docx-editor) — xom DOCX baytlari.
 * `silentError`: xato javobi ham arraybuffer bo'lib keladi, interceptor undan
 * xabarni o'qiy olmaydi — matnni store'ning o'zi dekod qilib ko'rsatadi.
 * Versiya tokeni javob header'ida: `x-document-version`.
 */
const _editorContent = async (payload) => {
  return await axios.get(`/v1/document/editor/content`, {
    params: payload.params,
    responseType: 'arraybuffer',
    silentError: true
  })
}

// Tahrirlash v2 — muharrir bergan DOCX'ni saqlash (multipart: file, model, document_id, version).
const _editorSave = async (payload) => {
  return await axios.post(`/v1/document/editor/save`, payload.data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export default {
  _confirmationDocument,
  _documentBase64,
  _addQRCode,
  _openDocument,
  _history,
  _confirmationContract,
  _confirmationCommand,
  _confirmationAdContract,
  _generateLink,
  _signature,
  _confirmationTimesheet,
  _editorContent,
  _editorSave
}
