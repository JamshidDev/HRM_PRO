import axios from '@/service/index.js'

// HR: ariza havolalari
const _types = async () => axios.get(`/v1/hr/application-links/types`)
const _index = async (payload) => axios.get(`/v1/hr/application-links`, { params: payload?.params })
const _create = async (payload) => axios.post(`/v1/hr/application-links`, payload.data)
const _revoke = async (payload) => axios.post(`/v1/hr/application-links/${payload.id}/revoke`)

// Ochiq havola (tizimga kirishsiz) — xatolar sahifaning o'zida ko'rsatiladi.
const pub = (token) => `/v1/application-links/${encodeURIComponent(token)}`
const quiet = { silentError: true }
const _info = async (token) => axios.get(pub(token), quiet)
const _schema = async (token) => axios.get(`${pub(token)}/schema`, quiet)
const _workers = async (token, search) => axios.get(`${pub(token)}/workers`, { params: { search }, ...quiet })
const _positions = async (token, workerId) => axios.get(`${pub(token)}/workers/${workerId}/positions`, quiet)
const _children = async (token, workerId) => axios.get(`${pub(token)}/workers/${workerId}/children`, quiet)
const _notices = async (token, workerId, types) =>
  axios.get(`${pub(token)}/workers/${workerId}/notices`, { params: { types }, ...quiet })
const _store = async (token, workerId, data) => axios.post(`${pub(token)}/workers/${workerId}/applications`, data)

export default {
  _types,
  _index,
  _create,
  _revoke,
  _info,
  _schema,
  _workers,
  _positions,
  _children,
  _notices,
  _store
}
