import axios from '@/service/index.js'

const _show = async () => {
  return await axios.get(`/v1/admin/document-settings`)
}

const _update = async (payload) => {
  return await axios.put(`/v1/admin/document-settings`, payload.data)
}

export default {
  _show,
  _update
}
