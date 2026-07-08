import axios from '@/service/index.js'

const _workerExams = async (payload) => {
  return await axios.get(`/v1/lms/worker-exams`, { params: payload?.params })
}

const _index = async (payload) => {
  return await axios.get(`/v1/lms/certificates`, { params: payload?.params })
}

// Sertifikatlar Excel hisoboti (ixtisoslik kesimida) — fonda, "Eksport" bo'limiga.
const _export = async (payload) => {
  return await axios.get(`/v1/lms/certificates/export`, { params: payload?.params })
}

// Imzolangan (QR bosilgan) sertifikat PDF'larini ZIP bilan yuklash — fonda,
// "Eksport" bo'limiga. Korxona nomi = folder, ichida "{FIO} ({number}).pdf".
const _downloadCertificates = async (payload) => {
  return await axios.get(`/v1/lms/certificates/download`, { params: payload?.params })
}

const _protocol = async (payload) => {
  return await axios.get(`/v1/lms/protocol`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/lms/certificate/generate`, payload.data)
}

const _group = async (payload) => {
  return await axios.get(`/v1/lms/list/groups`, { params: payload?.params })
}

const _eduPlan = async (payload) => {
  return await axios.get(`/v1/lms/list/edu-plans`, { params: payload?.params })
}

const _direction = async (payload) => {
  return await axios.get(`/v1/lms/list/directions`, { params: payload?.params })
}

const _specializations = async (payload) => {
  return await axios.get(`/v1/lms/list/specializations`, { params: payload?.params })
}
const _delete = async (payload) => {
  return await axios.delete(`/v1/lms/certificates/${payload.id}`)
}

export default {
  _workerExams,
  _create,
  _protocol,
  _index,
  _export,
  _downloadCertificates,
  _group,
  _eduPlan,
  _direction,
  _specializations,
  _delete
}
