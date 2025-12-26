import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/telegram`, { params: payload?.params })
}

const _users = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/telegram-users`, { params: payload?.params })
}

const _allDevices = async (payload) => {
  return await axios.get(`v1/turnstile/hik-central/all-devices`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/turnstile/hik-central/telegram`, payload?.data)
}

const _edit = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/telegram/${payload.id}`)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/turnstile/hik-central/telegram/${payload.id}`)
}

export default {
  _index,
  _create,
  _users,
  _delete,
  _allDevices,
  _edit
}
