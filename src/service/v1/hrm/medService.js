import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/worker-meds`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/hr/worker-meds`, payload.data)
}

const _show = async (payload) => {
  return await axios.get(`/v1/hr/worker-meds/${payload.id}/edit`, { params: payload?.params })
}

const _update = async (payload) => {
  return await axios.put(`/v1/hr/worker-meds/${payload.id}`, payload.data, {
    params: payload?.params
  })
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/worker-meds/${payload.id}`)
}

// Tibbiy ko'rik grafigi Excel'i — fon vazifasi (Yuklashlar tarixi).
const _scheduleExport = async (payload) => {
  return await axios.get(`/v1/hr/worker-meds/schedule/export`, {
    params: payload.params
  })
}

export default {
  _index,
  _scheduleExport,
  _create,
  _update,
  _delete,
  _show
}
