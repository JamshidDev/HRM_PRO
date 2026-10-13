import axios from '@/service/index.js'

const _index = async (params) => {
  return await axios.get('/v1/economist/salary-hidden', { params })
}

const _create = async (payload) => {
  return await axios.post('/v1/economist/salary-hidden', payload)
}

const _delete = async (id) => {
  return await axios.delete(`/v1/economist/salary-hidden/${id}`)
}

export default {
  _index,
  _create,
  _delete
}
