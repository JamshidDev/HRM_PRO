import axios from '../../index.js'

const _login = async (payload) => {
  return await axios.post(`/auth/login`, payload.data)
}

const _authCode = async (payload) => {
  return await axios.post(`/oauth/auth-code`, payload.data)
}

const _ssoClient = async (payload) => {
  return await axios.get(`/v1/sso/client`, { params: payload.params, silentError: true })
}

const _ssoCode = async (payload) => {
  return await axios.post(`/v1/sso/code`, payload.data)
}

// «HR Rail ilovasi orqali kirish» — brauzer sessiyasi va natijani olish.
const _appLoginStart = async (payload) => {
  return await axios.post(`/auth/app-login/start`, payload.data, { silentSuccess: true })
}

const _appLoginClaim = async (payload) => {
  return await axios.post(`/auth/app-login/claim`, payload.data, { silentSuccess: true, silentError: true })
}

const _registerOtp = async (payload) => {
  return await axios.post(`/auth/send-code`, payload.data)
}

const _register = async (payload) => {
  return await axios.post('/auth/register', payload.data)
}

const _getCaptcha = async () => {
  return await axios.get(`/auth/captcha`)
}

// loginnew: tiklash kodini tekshirish (kod Telegram bot orqali keladi)
const _verifyResetCode = async (payload) => {
  return await axios.post('/auth/password-reset/verify', payload.data)
}

// loginnew: yangi parolni saqlash
const _resetPassword = async (payload) => {
  return await axios.post('/auth/password-reset/confirm', payload.data)
}

// loginnew: 2FA kodini tekshirish — TODO: backend tayyor bo'lganda moslanadi
const _verifyTwoFactor = async (payload) => {
  return await axios.post('/auth/verify-2fa', payload.data)
}

// loginnew: 2FA kodini qayta yuborish — TODO: backend tayyor bo'lganda moslanadi
const _resendTwoFactor = async (payload) => {
  return await axios.post('/auth/resend-2fa', payload.data)
}

export default {
  _login,
  _registerOtp,
  _register,
  _authCode,
  _ssoClient,
  _ssoCode,
  _appLoginStart,
  _appLoginClaim,
  _getCaptcha,
  _verifyResetCode,
  _resetPassword,
  _verifyTwoFactor,
  _resendTwoFactor
}
