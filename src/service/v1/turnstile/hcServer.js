import axios from '@/service/index.js'

const _syncToServer = async (payload) => {
  return await axios.post(`/v1/turnstile/hik-central/workers/sync-to-server`, payload?.data, {
    params: payload?.params
  })
}

const _exportedJob = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/workers/exported-jobs`, {
    params: payload?.params
  })
}

const _accessLevels = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/workers/access-levels`, {
    params: payload?.params
  })
}

const _department = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/groups`, { params: payload?.params })
}
const _exportedError = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/workers/exported-errors`, {
    params: payload?.params
  })
}

export default {
  _syncToServer,
  _exportedJob,
  _accessLevels,
  _department,
  _exportedError
}
