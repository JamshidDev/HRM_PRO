import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/telegram/photos`, { params: payload?.params })
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/turnstile/hik-central/telegram/photos/${payload.id}`)
}

const _confirm = async (payload) => {
  return await axios.post(`/v1/turnstile/hik-central/telegram/photos/update`, payload?.data)
}

const _create = async (payload) => {
  return await axios.post(`/v1/turnstile/hik-central/telegram/photos`, payload?.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/turnstile/hik-central/telegram/photos/${payload.id}`, payload?.data)
}

export default {
  _index,
  _create,
  _update,
  _delete,
  _confirm
}
