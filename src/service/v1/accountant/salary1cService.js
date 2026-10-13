import axios from '@/service/index.js'

// 1C oylik hisobot. Backend: /api/v1/economist/salary-1c

const _pull = async (payload) => axios.post(`/v1/economist/salary-1c/pull`, payload.data)
// Bitta xodimni (pinfl) 1C dan qayta tortish — yangilangan payslip qaytadi.
const _pullOne = async (payload) => axios.post(`/v1/economist/salary-1c/pull-one`, payload.data)
const _ingestFixture = async (payload) => axios.post(`/v1/economist/salary-1c/ingest-fixture`, payload.data)
const _index = async (payload) => axios.get(`/v1/economist/salary-1c`, { params: payload?.params })
const _payslip = async (payload) => axios.get(`/v1/economist/salary-1c/${payload.id}`)
const _history = async (payload) => axios.get(`/v1/economist/salary-1c/history`, { params: payload?.params })
const _compareHistory = async (payload) => axios.get(`/v1/economist/salary-1c/history/compare`, { params: payload?.params })
const _orgTotals = async (payload) => axios.get(`/v1/economist/salary-1c/org-totals`, { params: payload?.params })
// Vedlar (1C to'lov turlari) ro'yxati + korxona×ved matritsasi.
const _veds = async (payload) => axios.get(`/v1/economist/salary-1c/veds`, { params: payload?.params })
const _vedMatrix = async (payload) => axios.get(`/v1/economist/salary-1c/veds-matrix`, { params: payload?.params })
// 1C AccruedByType bilan solishtirish (bitta korxona + oy).
const _reconcile = async (payload) => axios.get(`/v1/economist/salary-1c/reconcile`, { params: payload?.params })
// Ved drill-down: bir ved summasi qaysi xodimlardan.
const _vedWorkers = async (payload) => axios.get(`/v1/economist/salary-1c/ved-workers`, { params: payload?.params })
const _pullableOrgs = async () => axios.get(`/v1/economist/salary-1c/pullable-orgs`)
const _startBatchPull = async (payload) => axios.post(`/v1/economist/salary-1c/pull-batch`, payload.data)
const _activeBatchJob = async () => axios.get(`/v1/economist/salary-1c/pull-batch/active`)
const _batchJob = async (jobId) => axios.get(`/v1/economist/salary-1c/pull-batch/${jobId}`)
const _cancelBatch = async (jobId) =>
  axios.post(`/v1/economist/salary-1c/pull-batch/${jobId}/cancel`)
const _pullHistory = async (payload) => axios.get(`/v1/economist/salary-1c/pull-history`, { params: payload?.params })
const _pullHistoryExport = async (payload) =>
  axios.get(`/v1/economist/salary-1c/pull-history/export`, { params: payload?.params, responseType: 'blob' })
// 1C pull ma'lumot sifati anomaliyalari (dubl PINFL + kodsiz/matnli paying_code).
const _pullAnomalies = async (payload) => axios.get(`/v1/economist/salary-1c/pull-anomalies`, { params: payload?.params })
const _pullAnomaliesSummary = async (payload) => axios.get(`/v1/economist/salary-1c/pull-anomalies/summary`, { params: payload?.params })
const _getOrgCode = async (payload) => axios.get(`/v1/economist/salary-1c/org-code`, { params: payload?.params })
const _setOrgCode = async (payload) => axios.put(`/v1/economist/salary-1c/org-code`, payload.data)
// Ko'p 1C kod: korxonaga biriktirilgan kodlar ro'yxati + qo'shish/o'chirish.
const _getOrgCodes = async (payload) => axios.get(`/v1/economist/salary-1c/org-codes`, { params: payload?.params })
const _createOrgCode = async (payload) => axios.post(`/v1/economist/salary-1c/org-codes`, payload.data)
const _deleteOrgCode = async (payload) => axios.delete(`/v1/economist/salary-1c/org-codes/${payload.id}`)

// Oylik step-up — Telegram OTP (2FA). Kod foydalanuvchining Telegram'iga yuboriladi.
const _salaryAccessStatus = async () => axios.get(`/v1/economist/salary-access/status`)
const _salaryAccessRequestCode = async () =>
  axios.post(`/v1/economist/salary-access/request-code`)
const _salaryAccessVerifyCode = async (payload) =>
  axios.post(`/v1/economist/salary-access/verify-code`, payload.data)
const _salaryAccessLock = async () => axios.post(`/v1/economist/salary-access/lock`)

// Xodim self-view
const _mySalary = async (payload) => axios.get(`/v1/me/salary`, { params: payload?.params })
const _myMonths = async () => axios.get(`/v1/me/salary/months`)
const _myHistory = async (payload) => axios.get(`/v1/me/salary/history`, { params: payload?.params })

export default {
  _pull,
  _pullOne,
  _ingestFixture,
  _index,
  _payslip,
  _history,
  _compareHistory,
  _orgTotals,
  _veds,
  _vedMatrix,
  _reconcile,
  _vedWorkers,
  _pullableOrgs,
  _startBatchPull,
  _activeBatchJob,
  _batchJob,
  _cancelBatch,
  _pullHistory,
  _pullHistoryExport,
  _pullAnomalies,
  _pullAnomaliesSummary,
  _getOrgCode,
  _setOrgCode,
  _getOrgCodes,
  _createOrgCode,
  _deleteOrgCode,
  _salaryAccessStatus,
  _salaryAccessRequestCode,
  _salaryAccessVerifyCode,
  _salaryAccessLock,
  _mySalary,
  _myMonths,
  _myHistory
}
