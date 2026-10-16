import axios from '@/service/index.js'

const BASE = '/v1/chat/live'

const _conversations = (params) => axios.get(`${BASE}/conversations`, { params })
const _open = (userId) => axios.post(`${BASE}/conversations`, { user_id: userId })
const _users = (search) => axios.get(`${BASE}/users`, { params: { search } })
const _unreadCount = () => axios.get(`${BASE}/unread-count`)
const _messages = (id, params) => axios.get(`${BASE}/conversations/${id}/messages`, { params })
const _media = (id, type) => axios.get(`${BASE}/conversations/${id}/media`, { params: { type } })
const _sendText = (id, data) => axios.post(`${BASE}/conversations/${id}/messages`, data)
const _sendFiles = (id, formData) => axios.post(`${BASE}/conversations/${id}/files`, formData)
const _read = (id, messageId) => axios.post(`${BASE}/conversations/${id}/read`, { message_id: messageId })
const _pin = (id, pinned) => axios.patch(`${BASE}/conversations/${id}`, { pinned })
const _clear = (id) => axios.post(`${BASE}/conversations/${id}/clear`)
const _hide = (id) => axios.delete(`${BASE}/conversations/${id}`)
const _edit = (messageId, text) => axios.patch(`${BASE}/messages/${messageId}`, { text })
const _remove = (messageId) => axios.delete(`${BASE}/messages/${messageId}`)
const _forward = (messageId, userIds) => axios.post(`${BASE}/messages/${messageId}/forward`, { user_ids: userIds })
const _react = (messageId, emoji) => axios.put(`${BASE}/messages/${messageId}/reaction`, { emoji })

export default {
  _conversations,
  _open,
  _users,
  _unreadCount,
  _messages,
  _media,
  _sendText,
  _sendFiles,
  _read,
  _pin,
  _clear,
  _hide,
  _edit,
  _remove,
  _forward,
  _react
}
