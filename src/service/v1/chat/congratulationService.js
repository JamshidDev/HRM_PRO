import axios from '@/service/index.js'

const _index = async (payload) => {
    return await axios.get(`/v1/telegram/messages`, { params: payload?.params })
}

const _dashboard = async (payload) => {
    return await axios.get(`/v1/telegram/dashboard`, { params: payload?.params })
}


export default {
    _index,
    _dashboard,
}
