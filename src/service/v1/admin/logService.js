import axios from '@/service/index.js'

const _actionLog = async (payload) => {
  return await axios.get(`/v1/admin/activity-logs`, { params: payload.params })
}
const _authLog = async (payload) => {
  return await axios.get(`/v1/admin/authentication-logs`, { params: payload.params })
}

const _generateLogViewer = async () => {
  return await axios.get(`/v1/admin/generate-log-viewer`, { withCredentials: true })
}

const _wrongWorkerPins = async () => {
  return await axios.get(`/v1/admin/wrong-worker-pins`, { responseType: 'blob' })
}

// Imzo tarixi (signature-history-read)
const _signatureHistory = async (payload) => {
  return await axios.get(`/v1/admin/signature-history`, { params: payload.params })
}
const _signatureHistoryShow = async (payload) => {
  return await axios.get(`/v1/admin/signature-history/${payload.id}`)
}
const _signatureHistoryPkcs7 = async (payload) => {
  return await axios.get(`/v1/admin/signature-history/${payload.id}/pkcs7`)
}
const _signatureHistoryVerify = async (payload) => {
  return await axios.post(`/v1/admin/signature-history/${payload.id}/verify`)
}

export default {
  _actionLog,
  _signatureHistory,
  _signatureHistoryShow,
  _signatureHistoryPkcs7,
  _signatureHistoryVerify,
  _authLog,
  _generateLogViewer,
  _wrongWorkerPins
}
