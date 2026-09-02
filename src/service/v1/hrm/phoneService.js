// 🔴 Telefon FAQAT «Xodimlar → shaxsiy ma'lumotlar» sahifasidan o'zgartiriladi.
// Yozish metodlari (_create/_update/_delete) olib tashlandi — backendda ham
// mos endpointlar yopilgan.
import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/worker-phones`, { params: payload.params })
}

export default {
  _index
}
