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

export default {
    _index,
    _send,
    _send_batch
}
