import axios from '@/service/index.js'

// JSHSHIR (PINFL) ma'lumot-sifati auditi — ASYNC export job (Excel).
// Backend: GET /api/v1/admin/jshshir-audit-export (Permission: users-write).
// Parametr yo'q — foydalanuvchining role scope'i ichidagi faol xodimlar.
// Faqat muammoli (JSHSHIR uzunlik/jins/sana/asr/dublikat xatosi bor) xodimlar chiqadi.
// Javob darhol qaytadi ({message, data:[]}); Excel fonda quriladi va downloads'dan olinadi.
const _export = async () => {
  return await axios.get('/v1/admin/jshshir-audit-export')
}

export default {
  _export
}
