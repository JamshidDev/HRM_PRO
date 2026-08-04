import axios from '@/service/index.js'

// 1C oylik hisobot. Backend: /api/v1/economist/salary-1c

const _pull = async (payload) => axios.post(`/v1/economist/salary-1c/pull`, payload.data)
const _ingestFixture = async (payload) => axios.post(`/v1/economist/salary-1c/ingest-fixture`, payload.data)
const _index = async (payload) => axios.get(`/v1/economist/salary-1c`, { params: payload?.params })
const _payslip = async (payload) => axios.get(`/v1/economist/salary-1c/${payload.id}`)
const _history = async (payload) => axios.get(`/v1/economist/salary-1c/history`, { params: payload?.params })
const _orgTotals = async (payload) => axios.get(`/v1/economist/salary-1c/org-totals`, { params: payload?.params })
const _pullableOrgs = async () => axios.get(`/v1/economist/salary-1c/pullable-orgs`)
const _startBatchPull = async (payload) => axios.post(`/v1/economist/salary-1c/pull-batch`, payload.data)
const _activeBatchJob = async () => axios.get(`/v1/economist/salary-1c/pull-batch/active`)
const _batchJob = async (jobId) => axios.get(`/v1/economist/salary-1c/pull-batch/${jobId}`)
const _pullHistory = async (payload) => axios.get(`/v1/economist/salary-1c/pull-history`, { params: payload?.params })
const _pullHistoryExport = async (payload) =>
  axios.get(`/v1/economist/salary-1c/pull-history/export`, { params: payload?.params, responseType: 'blob' })
const _getOrgCode = async (payload) => axios.get(`/v1/economist/salary-1c/org-code`, { params: payload?.params })
const _setOrgCode = async (payload) => axios.put(`/v1/economist/salary-1c/org-code`, payload.data)

// Xodim self-view
const _mySalary = async (payload) => axios.get(`/v1/me/salary`, { params: payload?.params })
const _myMonths = async () => axios.get(`/v1/me/salary/months`)
const _myHistory = async (payload) => axios.get(`/v1/me/salary/history`, { params: payload?.params })

export default {
  _pull,
  _ingestFixture,
  _index,
  _payslip,
  _history,
  _orgTotals,
  _pullableOrgs,
  _startBatchPull,
  _activeBatchJob,
  _batchJob,
  _pullHistory,
  _pullHistoryExport,
  _getOrgCode,
  _setOrgCode,
  _mySalary,
  _myMonths,
  _myHistory
}
