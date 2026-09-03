import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/admin/mobile/users`, { params: payload.params })
}

const _show = async (payload) => {
  return await axios.get(`/v1/admin/mobile/users/${payload.id}`)
}

// Mobil ilova versiyasi (android/ios) — «Mobil versiya» kartasi.
const _versions = async () => {
  return await axios.get(`/v1/admin/mobile/users/versions`)
}

const _updateVersion = async (payload) => {
  return await axios.put(`/v1/admin/mobile/users/versions`, payload.data)
}

export default {
  _index,
  _show,
  _versions,
  _updateVersion
}
