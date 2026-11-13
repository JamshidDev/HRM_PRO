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

// Sahifadagi «Saqlash» — OnlyOffice sessiyasini majburan saqlash (natija last-save orqali).
const _forceSave = async (payload) => {
  return await axios.post(`/v1/admin/document-templates/save`, payload.data)
}

// «Bekor qilish» — saqlanmagan tahrir tashlab yuboriladi, shablon oxirgi saqlangan holatda qayta ochiladi.
const _discard = async (payload) => {
  return await axios.post(`/v1/admin/document-templates/discard`, payload.data)
}

export default {
  _index,
  _variables,
  _editorConfig,
  _lastSave,
  _forceSave,
  _discard
}
