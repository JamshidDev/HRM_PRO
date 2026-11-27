import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/admin/telegram/users`, { params: payload.params })
}
//
// const _create = async (payload)=>{
//     return await axios.post(`/v1/structure/specialities`, payload.data)
// }
//
// const _update = async (payload)=>{
//     return await axios.put(`/v1/structure/specialities/${payload.id}`, payload.data)
// }

// Backend'da o'chirish yo'q — botdan uzish (deaktivatsiya) chat_id bo'yicha.
const _delete = async (payload) => {
  return await axios.post(`/v1/admin/telegram/bot/users-detach`, { chat_ids: [payload.id] })
}

export default {
  _index,
  _delete
}
