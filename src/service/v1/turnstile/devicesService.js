import axios from "@/service/index.js"

const _index = async (payload) => {
    return await axios.get(`/v1/turnstile/hik-central/devices`, {params: payload?.params})
}

const _create = async (payload) => {
    return await axios.post(`/v1/turnstile/hik-central/devices`, payload?.data)
}

const _update = async (payload) => {
    return await axios.put(`/v1/turnstile/hik-central/devices/${payload.id}`, payload?.data)
}

const _delete = async (payload) => {
    return await axios.delete(`/v1/turnstile/hik-central/devices/${payload.id}`)
}

const _show = async (payload) => {
    return await axios.get(`/v1/turnstile/hik-central/devices/${payload.id}`)
}

export default {
    _index,
    _create,
    _update,
    _delete,
    _show,
}
