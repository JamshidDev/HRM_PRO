import axios from '@/service/index.js'

const _workerExams = async (payload) => {
    return await axios.get(`/v1/lms/worker-exams`, { params: payload?.params })
}

const _index = async (payload) => {
    return await axios.get(`/v1/lms/certificates`, { params: payload?.params })
}

const _protocol = async (payload) => {
    return await axios.get(`/v1/lms/protocol`, { params: payload?.params })
}

const _create = async (payload) => {
    return await axios.post(`/v1/lms/certificate/generate`, payload.data)
}


export default {
    _workerExams,
    _create,
    _protocol,
    _index,
}
