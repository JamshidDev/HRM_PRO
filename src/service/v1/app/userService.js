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

// Asosiy (login) telefon raqami — xodim kartochkasidagi mos raqam ham almashadi.
const _updatePhone = async (payload) => {
  return await axios.put(`/v1/admin/users/${payload?.id}/phone`, payload.data)
}

const _updatePin = async (payload) => {
  return await axios.put(`/v1/admin/users/${payload?.id}/pin`, payload.data)
}

// Foydalanuvchilar ro'yxati Excel'i — fon vazifasi (Yuklashlar tarixi).
const _export = async (payload) => {
  return await axios.get(`/v1/admin/users/export`, { params: payload.params })
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

// Bitta foydalanuvchini E-IMZO tasdig'idan ozod qilish (faqat Admin).
const _eimzoSkip = async (payload) => {
  return await axios.put(`/v1/admin/users/${payload.id}/eimzo-skip`, payload.data)
}

// Soft-delete user (backend: DELETE /v1/admin/users/:id — deleted_at=NOW()).
const _delete = async (payload) => {
  return await axios.delete(`/v1/admin/users/${payload?.id}`)
}

export default {
  _export,
  _index,
  _create,
  _myRoles,
  _update,
  _onSpam,
  _updatePin,
  _updatePhone,
  _userPermissions,
  _attachPermissions,
  _detachPermissions,
  _eimzoSkip,
  _delete
}
