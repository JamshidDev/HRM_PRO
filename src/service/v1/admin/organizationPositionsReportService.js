import axios from '@/service/index.js'

// Korxona kesimida LAVOZIMLAR (takrorsiz) — ASYNC export job (Excel).
// Backend: GET /api/v1/admin/organization-positions-export?organizations=  (Permission: users-write).
// Har lavozim korxona ichida BIR MARTA (DISTINCT ON org+position); boshqa korxonada takrorlanishi mumkin.
// `organizations` — vergul bilan ajratilgan korxona IDlari (tanlangan). Javob darhol qaytadi.
const _export = async (payload) => {
  return await axios.get('/v1/admin/organization-positions-export', {
    params: payload.params
  })
}

export default {
  _export
}
