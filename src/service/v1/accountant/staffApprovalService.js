import axios from '@/service/index.js'

const _index = async (payload) => {
    return await axios.get(`/v1/economist/staffing/approve`, { params: payload?.params })
}

const _showGenerate = async (payload) => {
    return await axios.get(`/v1/economist/staffing/generate`, {
        params: payload?.params
    })
}

const _create = async (payload) => {
    return await axios.post(`/v1/economist/staffing/generate`, payload?.data)
}

export default {
    _index,
    _create,
    _showGenerate
}
