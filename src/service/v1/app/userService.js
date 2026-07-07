import axios from '../../index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/admin/users`, { params: payload.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/admin/assign-role`, payload.data)
}

const _myRoles = async (payload) => {
  return await axios.get(`/v1/admin/users/${payload?.id}/roles`, { params: payload.params })
}

const _update = async (payload) => {
  return await axios.put(`/v1/admin/users/${payload?.id}/roles/detach`, payload.data)
}

const _loginByIdToSystem = async (payload) => {
  return await axios.get(`/v1/admin/users/${payload?.id}/login`, { params: payload.params })
}

const _temporaryToken = async (payload) => {
  return await axios.get(`/v1/admin/access-for-admin`, { params: payload?.params })
}

const _accessForAdmin = async (payload) => {
  return await axios.post(`/v1/user/access-for-admin`, payload?.data)
}

const _onSpam = async (payload) => {
  return await axios.post(`/v1/admin/users/${payload.id}/block`, payload?.data)
}

const _userPermissions = async (payload) => {
  return await axios.get(`/v1/admin/users/${payload?.id}/permissions`)
}

const _attachPermissions = async (payload) => {
  return await axios.post(`/v1/admin/users/${payload.id}/permissions/attach`, payload.data)
}

const _detachPermissions = async (payload) => {
  return await axios.put(`/v1/admin/users/${payload.id}/permissions/detach`, payload.data)
}

// Soft-delete user (backend: DELETE /v1/admin/users/:id — deleted_at=NOW()).
const _delete = async (payload) => {
  return await axios.delete(`/v1/admin/users/${payload?.id}`)
}

export default {
  _index,
  _create,
  _myRoles,
  _update,
  _loginByIdToSystem,
  _temporaryToken,
  _accessForAdmin,
  _onSpam,
  _userPermissions,
  _attachPermissions,
  _detachPermissions,
  _delete
}
