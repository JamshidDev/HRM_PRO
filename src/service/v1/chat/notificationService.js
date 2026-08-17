import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/notifications`, { params: payload.params })
}

const _send = async (payload) => {
  return await axios.post(`/v1/notifications/send`, payload.data)
}

const _send_batch = async (payload) => {
  return await axios.post(`/v1/notifications/send-batch`, payload.data)
}

const _send_topic = async (payload) => {
  return await axios.post(`/v1/notifications/send-topic`, payload.data)
}

const _push_logs = async (payload) => {
  return await axios.get(`/v1/notifications/push-logs`, { params: payload.params })
}

const _cancel_push = async (payload) => {
  return await axios.post(`/v1/notifications/push-logs/${payload.id}/cancel`)
}

const _user_index = async (payload) => {
  return await axios.get(`/v1/user/notifications`, {
    params: payload.params
  })
}

const _user_read = async (payload) => {
  return await axios.post(`/v1/user/notifications/mark-read`, payload.data)
}

export default {
  _index,
  _send,
  _send_batch,
  _send_topic,
  _push_logs,
  _cancel_push,
  _user_index,
  _user_read
}
