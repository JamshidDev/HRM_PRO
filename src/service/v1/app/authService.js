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

export default {
  _login,
  _registerOtp,
  _register,
  _authCode
}
