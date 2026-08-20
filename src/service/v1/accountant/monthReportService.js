import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/economist/statements`, { params: payload?.params })
}

const _show = async (payload) => {
  return await axios.get(`/v1/economist/statements/${payload.id}`, { params: payload?.params })
}

const _template = async (payload) => {
  return await axios.get(`/v1/economist/statement-example`, { params: payload?.params })
}

const _exportWithCode = async (payload) => {
  return await axios.post(`/v1/economist/statements-export-with-codes`, payload?.data)
}

const _exportWithCodeByYear = async (payload) => {
  return await axios.post(`/v1/economist/statements-export-with-codes-by-year`, payload?.data)
}

const _exportMultiple = async (payload) => {
  return await axios.get(`/v1/economist/statements-multiple-workers`, { params: payload?.params })
}

const _exportByPosition = async (payload) => {
  return await axios.get(`/v1/economist/statements-by-positions`, { params: payload?.params })
}

const _vedCodes = async () => {
  return await axios.get(`/v1/economist/statements-ved-codes`)
}

const _exportFiltered = async (payload) => {
  return await axios.get(`/v1/economist/statements-export-filtered`, { params: payload?.params })
}

const _vedReport = async (payload) => {
  return await axios.get(`/v1/economist/statements-ved-report`, { params: payload?.params })
}

const _vedReportExport = async (payload) => {
  return await axios.get(`/v1/economist/statements-ved-report-export`, { params: payload?.params })
}

const _vedThreshold = async (payload) => {
  return await axios.get(`/v1/economist/statements-ved-threshold`, { params: payload?.params })
}

const _vedThresholdExport = async (payload) => {
  return await axios.get(`/v1/economist/statements-ved-threshold-export`, {
    params: payload?.params
  })
}

export default {
  _index,
  _show,
  _template,
  _exportWithCode,
  _exportMultiple,
  _exportByPosition,
  _exportWithCodeByYear,
  _vedCodes,
  _exportFiltered,
  _vedReport,
  _vedReportExport,
  _vedThreshold,
  _vedThresholdExport
}
