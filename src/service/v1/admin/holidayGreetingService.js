import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/admin/holiday-greetings`, {
    params: payload.params,
    silentError: payload.silentError
  })
}

const _show = async (payload) => {
  return await axios.get(`/v1/admin/holiday-greetings/${payload.id}`)
}

const _create = async (payload) => {
  return await axios.post(`/v1/admin/holiday-greetings`, payload.data)
}

const _update = async (payload) => {
  return await axios.post(`/v1/admin/holiday-greetings/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/admin/holiday-greetings/${payload.id}`)
}

const _overrideUpsert = async (payload) => {
  return await axios.put(`/v1/admin/holiday-greetings/${payload.id}/overrides`, payload.data)
}

const _overrideDelete = async (payload) => {
  return await axios.delete(
    `/v1/admin/holiday-greetings/${payload.id}/overrides/${payload.overrideId}`
  )
}

export default {
  _index,
  _show,
  _create,
  _update,
  _delete,
  _overrideUpsert,
  _overrideDelete
}
