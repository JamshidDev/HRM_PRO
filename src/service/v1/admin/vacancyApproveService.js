import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/structure/vacancy-approve/organizations`, { params: payload?.params })
}

const _attach = async (payload) => {
  return await axios.post(`/v1/structure/vacancy-approve/attach`, payload?.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/structure/vacancy-approve/organizations/${payload.id}`)
}

export default {
  _index,
  _attach,
  _delete
}
