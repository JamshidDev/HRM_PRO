import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/events`, { params: payload?.params })
}

const _preview = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/stats-preview`, { params: payload?.params })
}

const _download = async (payload) => {
  return await axios.get(`/v1/turnstile/schedule/stats-preview`, {
    responseType: 'blob',
    params: payload?.params
  })
}

const _jobIndex = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/sync/jobs`, { params: payload?.params })
}
const _jobCreate = async (payload) => {
  return await axios.post(`/v1/turnstile/hik-central/sync/jobs`, payload?.data)
}

const _sync = async (payload) => {
  return await axios.post(`/v1/turnstile/hik-central/events/sync`, payload?.data)
}

const _dashboard = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/dashboard`, { params: payload?.params })
}

const _dashboardChart = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/dashboard/daily-attendance`, {
    params: payload?.params
  })
}

const _dashboardDevices = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/dashboard/devices`, { params: payload?.params })
}

const _dashboardStat = async (payload) => {
  return await axios.get(`/v1/turnstile/hik-central/dashboard/worker-stats`, {
    params: payload?.params
  })
}

const _allDashboard = async (payload) => {
  return await axios.get(payload.url, { params: payload?.params })
}

export default {
  _index,
  _dashboard,
  _preview,
  _download,
  _jobIndex,
  _jobCreate,
  _sync,
  _dashboardChart,
  _dashboardDevices,
  _dashboardStat,
  _allDashboard
}
