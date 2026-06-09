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

export default {
  _actionLog,
  _authLog,
  _generateLogViewer,
  _wrongWorkerPins
}
