import axios from '../../index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/user/profile`)
}
const _update = async (payload) => {
  return await axios.put(`/v1/user/update`, payload?.data)
}
const _logOut = async (payload) => {
  return await axios.get(`/v1/user/logout`)
}

const _roles = async (payload) => {
  return await axios.get(`/v1/user/roles`)
}
const _changeRole = async (payload) => {
  return await axios.put(`/v1/user/change-organization`, payload?.data)
}
const _orgInfo = async (payload) => {
  return await axios.get(`/v1/user/organization-info`)
}

const _updateOrgInfo = async (payload) => {
  return await axios.put(`/v1/user/organization-info`, payload?.data)
}

// Offertani qabul qilish. Login vaqtida token hali localStorage'ga saqlanmagan bo'ladi
// (foydalanuvchi "Tanishdim" bosmaguncha kirmaydi), shuning uchun token'ni bevosita
// Authorization header sifatida uzatamiz — interceptor localStorage bo'sh bo'lsa uni bosmaydi.
const _acceptOffer = async (payload) => {
  const config = payload?.token ? { headers: { Authorization: 'Bearer ' + payload.token } } : {}
  return await axios.post(`/v1/user/accept-offer`, {}, config)
}

// Profil > Xavfsizlik: kirish usulini yoqish/o'chirish (joriy parol bilan tasdiqlanadi).
// FAQAT web — mobil ilova bu sozlamani o'zgartira olmaydi.
const _updateLoginMethod = async (payload) => {
  return await axios.put(`/v1/user/security/login-methods`, payload.data)
}

export default {
  _index,
  _update,
  _logOut,
  _roles,
  _changeRole,
  _orgInfo,
  _updateOrgInfo,
  _acceptOffer,
  _updateLoginMethod
}
