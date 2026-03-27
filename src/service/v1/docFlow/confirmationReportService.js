import axios from '../../index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/confirmation/reports`, { params: payload.params })
}

export default {
  _index
}
