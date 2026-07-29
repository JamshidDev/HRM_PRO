import axios from '@/service/index.js'

// Korxona shtatkasi (штат жадвали) — ASYNC export job (Excel).
// Backend: GET /api/v1/admin/organization-staffing-export?organizations=  (Permission: users-write).
// `organizations` — vergul bilan ajratilgan korxona IDlari (tanlangan).
// Javob darhol qaytadi ({message, data:[]}); Excel fonda quriladi, downloads'dan olinadi.
const _export = async (payload) => {
  return await axios.get('/v1/admin/organization-staffing-export', {
    params: payload.params
  })
}

export default {
  _export
}
