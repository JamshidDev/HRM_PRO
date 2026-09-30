import axios from '@/service/index.js'

// Oylik nazorati (salary-control) — umumiy ko'rsatkichlar (KPI) xulosasi.
const _salaryControlSummary = (payload) => {
  return axios.get('/v1/economist/salary-control/summary', { params: payload?.params })
}

// Oylik nazorati — 14 ta risk (xavf-xatar) xaritasi.
const _salaryControlRisks = (payload) => {
  return axios.get('/v1/economist/salary-control/risks', { params: payload?.params })
}

export default {
  _salaryControlSummary,
  _salaryControlRisks
}
