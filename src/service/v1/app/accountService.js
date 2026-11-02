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
  // `silentError` — bosh sahifada ob-havo uchun shahar aniqlanayotganda
  // xato toast chiqarmasin (`src/service/index.js` interceptori tekshiradi).
  return await axios.get(`/v1/user/organization-info`, {
    silentError: payload?.silentError
  })
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

const _ssoLogins = async (payload) => {
  return await axios.get(`/v1/sso/logins`, { params: payload?.params })
}
const _ssoLoginClients = async () => {
  return await axios.get(`/v1/sso/logins/clients`)
}
// Kirishlar tarixi — Excel fayl (filtr bilan).
const _ssoLoginsExport = async (payload) => {
  return await axios.get(`/v1/sso/logins/export`, {
    params: payload?.params,
    responseType: 'blob'
  })
}

// HRM bot: ulanish holati va bir martalik ulash havolasi.
const _telegramStatus = async () => {
  return await axios.get(`/v1/user/telegram`)
}
const _telegramLink = async () => {
  return await axios.post(`/v1/user/telegram/link`)
}

// Faol seanslar (web + mobil qurilmalar).
const _sessions = async () => {
  return await axios.get(`/v1/user/sessions`)
}
// Seansni yakunlash (60 daqiqalik himoya backendda tekshiriladi).
const _revokeSession = async (payload) => {
  return await axios.delete(`/v1/user/sessions/${payload.id}`)
}
const _revokeOtherSessions = async () => {
  return await axios.post(`/v1/user/sessions/revoke-others`)
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
  _updateLoginMethod,
  _ssoLogins,
  _ssoLoginClients,
  _ssoLoginsExport,
  _telegramStatus,
  _telegramLink,
  _sessions,
  _revokeSession,
  _revokeOtherSessions
}
