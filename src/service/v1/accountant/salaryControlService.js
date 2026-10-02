import axios from '@/service/index.js'

// Oylik nazorati (salary-control) — umumiy ko'rsatkichlar (KPI) xulosasi.
const _salaryControlSummary = (payload) => {
  return axios.get('/v1/economist/salary-control/summary', { params: payload?.params })
}

// Oylik nazorati — 14 ta risk (xavf-xatar) xaritasi.
const _salaryControlRisks = (payload) => {
  return axios.get('/v1/economist/salary-control/risks', { params: payload?.params })
}

// Oylik nazorati — 9 bo'limli dashboard uchun yagona payload
// (kpi + emps + vids + F + rc). Butun analitika shu massivlardan quriladi.
const _salaryControlDashboard = (payload) => {
  return axios.get('/v1/economist/salary-control/dashboard', { params: payload?.params })
}

// Oylik nazorati — reestrlarni haqiqiy .xlsx fayl qilib yuklab olish
// (type: rules | findings | employees | all). Blob sifatida qaytadi.
const _salaryControlExport = (payload) => {
  return axios.get('/v1/economist/salary-control/export', {
    params: payload?.params,
    responseType: 'blob'
  })
}

export default {
  _salaryControlSummary,
  _salaryControlRisks,
  _salaryControlDashboard,
  _salaryControlExport
}
