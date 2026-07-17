import axios from '@/service/index.js'

// Kech qoluvchilar yarim yillik hisoboti — ASYNC export job (Excel).
// Backend: GET /api/v1/admin/late-workers-half-year-export (Permission: users-write).
// Params: organizations (CSV), access_levels (CSV), from (YYYY-MM), to (YYYY-MM), start_time (HH:MM).
// Javob darhol qaytadi ({message, data:[]}); Excel fonda quriladi va export-tasks/downloads
// ro'yxatidan olinadi (boshqa job Excellar kabi).
const _export = async (payload) => {
  return await axios.get('/v1/admin/late-workers-half-year-export', {
    params: payload.params
  })
}

export default {
  _export
}
