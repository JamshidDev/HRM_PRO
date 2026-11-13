import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/admin/document-templates`, { params: payload?.params })
}

// Shablondagi `${...}` o'zgaruvchilar — nomi, tavsifi va namunasi bilan.
const _variables = async (payload) => {
  return await axios.get(`/v1/admin/document-templates/variables`, { params: payload.params })
}

// OnlyOffice sozlamasi (backend imzolaydi; yozish ruxsati bo'lsa — tahrir rejimi).
const _editorConfig = async (payload) => {
  return await axios.get(`/v1/admin/document-templates/editor-config`, { params: payload.params })
}

// OnlyOffice saqlagandan keyingi natija (saqlandi / rad etildi + sabab).
const _lastSave = async (payload) => {
  return await axios.get(`/v1/admin/document-templates/last-save`, { params: payload.params })
}

// Standart (git'dagi) shablonga qaytarish — global override o'chadi.
const _reset = async (payload) => {
  return await axios.delete(`/v1/admin/document-templates/${payload.category}/${payload.type}`)
}

export default {
  _index,
  _variables,
  _editorConfig,
  _lastSave,
  _reset
}
