import axios from '../../index.js'

const _login = async (payload) => {
  return await axios.post(`/auth/login`, payload.data)
}

const _authCode = async (payload) => {
  return await axios.post(`/oauth/auth-code`, payload.data)
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
  _getCaptcha,
  _verifyResetCode,
  _resetPassword,
  _verifyTwoFactor,
  _resendTwoFactor
}
