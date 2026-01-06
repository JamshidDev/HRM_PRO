import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/hr/edu-plans/attached-workers`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/hr/edu-plans/attach-workers`, payload.data)
}

const _delete = async (payload) => {
  return await axios.post(`/v1/hr/edu-plans/detach-workers`, payload.data)
}
const _workers = async (payload) => {
  return await axios.get(`/v1/hr/edu-plans/search-workers`, { params: payload?.params })
}

const _eduPlans = async (payload) => {
  return await axios.get(`/v1/hr/edu-plans`, { params: payload?.params })
}

export default {
  _index,
  _create,
  _delete,
  _workers,
  _eduPlans
}
