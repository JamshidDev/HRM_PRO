import axios from '@/service/index.js'

const _start = async (payload) => {
  return await axios.post(`/v1/exam/worker-exams/start-video`, payload.data)
}

const _getUrl = async (payload) => {
  return await axios.post(`/v1/exam/worker-exams/get-url`, payload.data)
}

const _finishVideo = async (payload) => {
  return await axios.put(`/v1/exam/worker-exams/finish-video`, payload.data)
}

export default {
  _start,
  _getUrl,
  _finishVideo
}
