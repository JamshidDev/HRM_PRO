import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/sync`, { params: payload.params })
}

const _show = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/sync/${payload.id}`, { params: payload.params })
}

const _offlineDevice = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/sync/${payload.id}/offline-devices`, {
    params: payload.params
  })
}

export default {
  _index,
  _show,
  _offlineDevice
}
