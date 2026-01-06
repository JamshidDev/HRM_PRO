import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/exam/results`, { params: payload.params })
}

const _finishedExam = async (payload) => {
  return await axios.get(`/v1/exam/check-ended-results`, { params: payload?.params })
}

const _downloadExam = async (payload) => {
  return await axios.get(`/v1/exam/results/export`, { params: payload?.params })
}
const _downloadNoPassedWorker = async (payload) => {
  return await axios.get(`/v1/exam/not-passed-workers`, { params: payload?.params })
}

// const _create = async (payload)=>{
//     return await axios.post(`/v1/exam/categories`, payload.data)
// }
//
// const _update = async (payload)=>{
//     return await axios.put(`/v1/exam/categories/${payload.id}`, payload.data)
// }
//
const _delete = async (payload) => {
  return await axios.delete(`/v1/exam/worker-exams/${payload.id}`)
}

const _exams = async (payload) => {
  return await axios.get(`/v1/exam/filter/exams`, { params: payload?.params })
}

const _topics = async (payload) => {
  return await axios.get(`/v1/exam/filter/topics`, { params: payload?.params })
}

export default {
  _index,
  // _create,
  // _update,
  _delete,
  _downloadNoPassedWorker,
  _finishedExam,
  _downloadExam,
  _exams,
  _topics
}
