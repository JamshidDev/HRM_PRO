import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/telegram/broadcasts`, { params: payload.params })
}

const _show = async (payload) => {
  return await axios.get(`/v1/telegram/broadcasts/${payload.id}`)
}

const _store = async (payload) => {
  return await axios.post(`/v1/telegram/broadcasts`, payload.data)
}

const _recipients = async (payload) => {
  return await axios.get(`/v1/telegram/broadcasts/${payload.id}/recipients`, {
    params: payload.params
  })
}

const _cancel = async (payload) => {
  return await axios.post(`/v1/telegram/broadcasts/${payload.id}/cancel`)
}

export default {
  _index,
  _show,
  _store,
  _recipients,
  _cancel
}
