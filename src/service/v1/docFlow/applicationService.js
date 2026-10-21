import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/applications`, { params: payload.params })
}
const _generateUrl = async (payload) => {
  return await axios.post(`/v1/hr/applications/generate-url`, payload.data, {
    params: payload.params
  })
}
const _confIndex = async (payload) => {
  return await axios.get(`/v1/confirmation/applications`, { params: payload.params })
}
const _checkApplication = async (payload) => {
  return await axios.post(`/v1/document/application-confirmation`, payload.data, {
    params: payload.params
  })
}
const _workerApplication = async (payload) => {
  return await axios.post(`/v1/worker-application/applications`, payload.data, {
    params: payload.params
  })
}
const _updateWorkerApplication = async (payload) => {
  return await axios.put(`/v1/worker-application/applications/${payload.id}/update`, payload.data)
}
const _deleteWorkerApplication = async (payload) => {
  return await axios.delete(`/v1/worker-application/applications/${payload.id}`, payload.data)
}
const _myPositions = async (payload) => {
  return await axios.get(`/v1/worker-application/positions`, { params: payload?.params })
}

const _confirmation = async (payload) => {
  return await axios.get(`/v1/worker-application/confirmations`, { params: payload?.params })
}
const _vacationWorker = async (payload) => {
  return await axios.get(`/v1/worker-application/temporarily-workers`, { params: payload?.params })
}
const _workerVacation = async (payload) => {
  return await axios.post(`/v1/hr/vacations/create`, payload?.data, { params: payload?.params })
}
const _details = async (payload) => {
  return await axios.get(`/v1/worker-application/applications/${payload.id}/edit`, {
    params: payload?.params
  })
}

const _accept = async (payload) => {
  return await axios.put(`/v1/hr/applications/${payload.id}/accept`, payload.data)
}

// HR imzo qatorini oladi (yo'q bo'lsa yaratiladi) va kelishuvchilarga yo'naltiradi.
const _signStart = async (payload) => {
  return await axios.post(`/v1/hr/applications/${payload.id}/sign-start`)
}
const _approverOptions = async (payload) => {
  return await axios.get(`/v1/hr/applications/${payload.id}/approvers`)
}
const _route = async (payload) => {
  return await axios.get(`/v1/hr/applications/${payload.id}/route`)
}
const _updateRoute = async (payload) => {
  return await axios.put(`/v1/hr/applications/${payload.id}/approvers`, payload.data)
}
const _resend = async (payload) => {
  return await axios.post(`/v1/hr/applications/${payload.id}/resend`, payload.data)
}
const _forward = async (payload) => {
  return await axios.post(`/v1/hr/applications/${payload.id}/forward`, payload.data)
}

const _documentApplication = async (payload) => {
  return await axios.get(`/v1/document/applications`, { params: payload?.params })
}

const _statistic = async (payload) => {
  return await axios.get(`/v1/worker-application/statistics`, { params: payload?.params })
}

export default {
  _index,
  _generateUrl,
  _confIndex,
  _checkApplication,
  _workerApplication,
  _myPositions,
  _confirmation,
  _vacationWorker,
  _workerVacation,
  _details,
  _updateWorkerApplication,
  _accept,
  _signStart,
  _approverOptions,
  _route,
  _updateRoute,
  _resend,
  _forward,
  _documentApplication,
  _statistic,
  _deleteWorkerApplication
}
