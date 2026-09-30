import axios from '@/service/index.js'

// Oylik nazorati (salary-control) — umumiy ko'rsatkichlar (KPI) xulosasi.
const _salaryControlSummary = (payload) => {
  return axios.get('/v1/economist/salary-control/summary', { params: payload?.params })
}

export default {
  _salaryControlSummary
}
