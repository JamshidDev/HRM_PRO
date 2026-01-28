
import axios from '@/service/index.js'

const _index = async (payload) => {
    return await axios.get(`/v1/turnstile/hik-central/approve-al/list`, { params: payload?.params })
}

const _show = async (payload) => {
    return await axios.get(`/v1/turnstile/hik-central/approve-al/list/${payload?.id}`, { params: payload?.params })
}

const _accessLevels = async (payload) => {
    return await axios.get(`/v1/turnstile/hik-central/approve-al/als`, { params: payload?.params })
}

const _create = async (payload) => {
    return await axios.post(`/v1/turnstile/hik-central/approve-al/list`, payload.data)
}

const _approve = async (payload) => {
    return await axios.post(`/v1/turnstile/hik-central/approve-al/approved/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
    return await axios.delete(`/v1/turnstile/hik-central/approve-al/list/${payload.id}`)
}

export default {
    _index,
    _create,
    _show,
    _accessLevels,
    _approve,
    _delete
}
