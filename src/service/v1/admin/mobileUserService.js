import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/admin/mobile/users`, { params: payload.params })
}

const _show = async (payload) => {
  return await axios.get(`/v1/admin/mobile/users/${payload.id}`)
}

export default {
  _index,
  _show
}
