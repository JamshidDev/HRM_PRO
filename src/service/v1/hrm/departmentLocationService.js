import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/extra/department/list`, { params: payload?.params })
}

const _locationIndex = async (payload) => {
  return await axios.get(`/v1/extra/department/locations`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/extra/department/locations`, payload.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/extra/department/locations/${payload.id}`, payload.data)
}

const _show = async (payload) => {
  return await axios.get(`/v1/extra/department/locations/${payload.id}`)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/extra/department/locations/${payload.id}`)
}

// Mobile face: kartalar statistikasi va xodim joylari.
const _faceStats = async (payload) => {
  return await axios.get(`/v1/extra/mobile-face/stats`, { params: payload?.params })
}

const _faceWorkers = async (payload) => {
  return await axios.get(`/v1/extra/mobile-face/workers`, { params: payload?.params })
}

const _workerLocations = async (payload) => {
  return await axios.get(`/v1/extra/mobile-face/worker-locations`, { params: payload?.params })
}

const _createWorkerLocation = async (payload) => {
  return await axios.post(`/v1/extra/mobile-face/worker-locations`, payload.data)
}

const _updateWorkerLocation = async (payload) => {
  return await axios.put(`/v1/extra/mobile-face/worker-locations/${payload.id}`, payload.data)
}

const _deleteWorkerLocation = async (payload) => {
  return await axios.delete(`/v1/extra/mobile-face/worker-locations/${payload.id}`)
}

// Turniket lokatsiyalari — qayta ishlatiladigan o'tish joylari.
const _places = async (payload) => {
  return await axios.get(`/v1/extra/mobile-face/places`, { params: payload?.params })
}

const _showPlace = async (payload) => {
  return await axios.get(`/v1/extra/mobile-face/places/${payload.id}`)
}

const _createPlace = async (payload) => {
  return await axios.post(`/v1/extra/mobile-face/places`, payload.data)
}

const _updatePlace = async (payload) => {
  return await axios.put(`/v1/extra/mobile-face/places/${payload.id}`, payload.data)
}

const _deletePlace = async (payload) => {
  return await axios.delete(`/v1/extra/mobile-face/places/${payload.id}`)
}

export default {
  _places,
  _showPlace,
  _createPlace,
  _updatePlace,
  _deletePlace,
  _faceStats,
  _faceWorkers,
  _workerLocations,
  _createWorkerLocation,
  _updateWorkerLocation,
  _deleteWorkerLocation,
  _index,
  _locationIndex,
  _create,
  _update,
  _delete,
  _show
}
