import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/vacancy`, { params: payload.params })
}

const _show = async (payload) => {
  return await axios.get(`/v1/hr/vacancy/${payload.id}/edit`, { params: payload.params })
}

const _view = async (payload) => {
  return await axios.get(`/v1/hr/vacancy/${payload.id}`, { params: payload.params })
}

const _store = async (payload) => {
  return await axios.post(`/v1/hr/vacancy/positions`, payload?.data)
}

const _update = async (payload) => {
  return await axios.put(`/v1/hr/vacancy/${payload.id}`, payload?.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/hr/vacancy/${payload.id}`)
}

const _vacancyPosition = async (payload) => {
  return await axios.get(`/v1/hr/vacancy/positions`, { params: payload.params })
}

const _applications = async (payload) => {
  return await axios.get(`/v1/hr/vacancy/${payload.id}/applications`, { params: payload.params })
}

const _applicationAction = async (payload) => {
  return await axios.put(`/v1/hr/vacancy/${payload.vacancyId}/applications/${payload.applicationId}`, payload.data)
}

const _changeStatus = async (payload) => {
  return await axios.put(`/v1/hr/vacancy/${payload.id}/change-status`)
}

const _enums = async () => {
  return await axios.get(`/v1/hr/enums`)
}

const _updateApplicationLevel = async (payload) => {
  return await axios.put(
    `/v1/hr/vacancy/${payload.vacancyId}/applications/${payload.applicationId}/update`,
    payload.data
  )
}

const _uploadApplicationFile = async (payload) => {
  return await axios.post(
    `/v1/hr/vacancy/${payload.vacancyId}/applications/${payload.applicationId}/upload`,
    payload.formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}

const _createMeet = async (payload) => {
  return await axios.post(
    `/v1/hr/vacancy/${payload.vacancyId}/applications/${payload.applicationId}/create-meet`,
    payload.data
  )
}

const _filterExams = async (payload) => {
  return await axios.get(`/v1/exam/filter/exams`, { params: payload?.params })
}

const _attachExam = async (payload) => {
  return await axios.put(
    `/v1/hr/vacancy/${payload.vacancyId}/applications/${payload.applicationId}/attach-exam`,
    payload.data
  )
}

const _detachExam = async (payload) => {
  return await axios.put(
    `/v1/hr/vacancy/${payload.vacancyId}/applications/${payload.applicationId}/detach-exam`,
    payload.data
  )
}

const _updateExam = async (payload) => {
  return await axios.put(
    `/v1/hr/vacancy/${payload.vacancyId}/applications/${payload.applicationId}/update-exam`,
    payload.data
  )
}

const _showUser = async (payload) => {
  return await axios.get(
    `/v1/hr/vacancy/${payload.vacancyId}/applications/${payload.applicationId}/show-user`
  )
}

const _finishVacancy = async (payload) => {
  return await axios.put(`/v1/hr/vacancy/${payload.id}/finish`, payload.data)
}

export default {
  _index,
  _store,
  _show,
  _view,
  _vacancyPosition,
  _update,
  _delete,
  _applications,
  _applicationAction,
  _changeStatus,
  _enums,
  _updateApplicationLevel,
  _uploadApplicationFile,
  _createMeet,
  _filterExams,
  _attachExam,
  _detachExam,
  _updateExam,
  _showUser,
  _finishVacancy
}
