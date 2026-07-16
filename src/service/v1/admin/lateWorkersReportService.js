import axios from '@/service/index.js'

// Kech qoluvchilar (davr bo'yicha, har-xodim detali) — ASYNC export job (Excel).
// Backend: GET /api/v1/admin/late-workers-export (Permission: users-write).
// Params: from, to (sana), start_time (HH:MM), organizations (CSV), access_levels (CSV).
// Javob darhol qaytadi ({message,data:[]}); Excel fonda quriladi, downloads ro'yxatidan olinadi.
const _lateWorkersExport = async (payload) => {
  return await axios.get('/v1/admin/late-workers-export', {
    params: payload.params
  })
}

export default {
  _lateWorkersExport
}
