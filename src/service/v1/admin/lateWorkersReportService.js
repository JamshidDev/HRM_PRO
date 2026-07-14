import axios from '@/service/index.js'

// Muntazam kech qoluvchilar hisoboti — Excel (sinxron blob download).
// Backend: GET /api/v1/admin/late-workers-export (Permission: users-write).
// Params: from, to, start_time (HH:MM), organizations (CSV "1,2,3").
const _lateWorkersExport = async (payload) => {
  return await axios.get('/v1/admin/late-workers-export', {
    params: payload.params,
    responseType: 'blob'
  })
}

export default {
  _lateWorkersExport
}
