import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/turnstile/terminals`, { params: payload.params })
}

// Faqat ro'yxat — «Tashkilot va guruhlar» formasidagi terminal tanlovi uchun.
export default {
  _index
}
