import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/lms/exams`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/lms/exams/attach`, payload.data)
}

const _result = async (payload) => {
  return await axios.get(`/v1/lms/exams/result`, { params: payload?.params })
}

const _delete = async (payload) => {
  return await axios.get(`/v1/lms/exams/detach/${payload.id}`)
}

// «Natijalar» filtri dropdownlari — ro'yxat faqat natijalarda uchraydigan
// mavzu/imtihonlardan quriladi (sahifa ruxsati `lms-result-read` bilan).
const _resultTopics = async (payload) => {
  return await axios.get(`/v1/lms/exams/filter/topics`, { params: payload?.params })
}

const _resultExams = async (payload) => {
  return await axios.get(`/v1/lms/exams/filter/exams`, { params: payload?.params })
}

export default {
  _index,
  _create,
  _result,
  _delete,
  _resultTopics,
  _resultExams
}
