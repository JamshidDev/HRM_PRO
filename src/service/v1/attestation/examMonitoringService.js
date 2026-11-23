import axios from '@/service/index.js'

// Imtihon kuzatuvi: faol mavzular, yechayotganlar, jonli kuzatuv sessiyasi.
const _topics = async (params) => axios.get('/v1/exam/monitoring/topics', { params })
const _solving = async (topicId) => axios.get(`/v1/exam/monitoring/topics/${topicId}/solving`)
const _finished = async (topicId, params) =>
  axios.get(`/v1/exam/monitoring/topics/${topicId}/finished`, { params })
const _alert = async (workerExamId, text) =>
  axios.post(`/v1/exam/monitoring/attempts/${workerExamId}/alert`, { text })
const _watch = async (workerExamId) => axios.post(`/v1/exam/monitoring/watch/${workerExamId}`)
const _stop = async (sessionId) => axios.post(`/v1/exam/monitoring/watch/${sessionId}/stop`)
const _requirements = async (workerExamId) =>
  axios.get(`/v1/exam/proctoring/attempts/${workerExamId}/requirements`)

export default { _topics, _solving, _finished, _alert, _watch, _stop, _requirements }
