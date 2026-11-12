import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/incentives`, { params: payload.params })
}

const _awards = async () => {
  return await axios.get(`/v1/hr/incentives/awards`)
}

export default {
  _index,
  _awards
}
