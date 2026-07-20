import axios from '@/service/index.js'

// F.I.Sh (ism/familiya/otasining ismi) ma'lumot sifati auditi — ASYNC export job (Excel).
// Backend: GET /api/v1/admin/name-audit-export
// Parametr yo'q — foydalanuvchining role scope'i (childIds) ichidagi faol xodimlar.
// Aniqlanadigan nuqsonlar: ismda raqam, nol (0) harf O o'rnida, ortiqcha punktuatsiya,
// lotin/kiril aralash, nostandart apostrof, o'rinbosar qiymat (XXX/./TEST).
// ⚠️ Probel nuqsonlari ATAYLAB kirmaydi — ular avtomatik tozalanadi.
// Javob darhol qaytadi ({message, data:[]}); Excel fonda quriladi va export-tasks/downloads
// ro'yxatidan olinadi (boshqa job Excellar kabi).
const _export = async () => {
  return await axios.get('/v1/admin/name-audit-export')
}

export default {
  _export
}
