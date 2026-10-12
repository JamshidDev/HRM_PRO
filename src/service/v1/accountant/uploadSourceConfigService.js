import axios from '@/service/index.js'

const _index = async () => {
  return await axios.get('/v1/economist/upload-source-config')
}

const _upsert = async (payload) => {
  return await axios.post('/v1/economist/upload-source-config', payload)
}

const _delete = async (org_id) => {
  return await axios.delete(`/v1/economist/upload-source-config/${org_id}`)
}

export default {
  _index,
  _upsert,
  _delete
}
