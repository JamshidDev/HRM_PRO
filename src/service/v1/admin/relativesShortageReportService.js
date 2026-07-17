import axios from '@/service/index.js'

// Yaqin qarindoshi kam (3 tadan kam: 0/1/2) bo'lgan xodimlar ro'yxati — ASYNC export job (Excel).
// Backend: GET /api/v1/admin/relatives-shortage-export (Permission: users-write).
// Parametr yo'q — foydalanuvchining role scope'i (childIps) ichidagi faol xodimlar.
// Javob darhol qaytadi ({message, data:[]}); Excel fonda quriladi va export-tasks/downloads
// ro'yxatidan olinadi (boshqa job Excellar kabi).
const _export = async () => {
  return await axios.get('/v1/admin/relatives-shortage-export')
}

export default {
  _export
}
