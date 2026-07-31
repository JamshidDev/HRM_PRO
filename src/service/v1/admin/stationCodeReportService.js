import axios from '@/service/index.js'

// Bo'limlar + station kodlar — ASYNC export job (Excel, bir varaq "Bo'limlar").
// Backend: GET /api/v1/admin/station-codes-export (Permission: users-write).
// Parametrsiz → barcha bo'lim (role scope ichida). Javob darhol qaytadi;
// Excel fonda quriladi, yuklab olishlar (export tasks)dan olinadi.
const _export = async () => {
  return await axios.get('/v1/admin/station-codes-export')
}

export default {
  _export
}
