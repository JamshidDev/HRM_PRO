import axios from "@/service/index.js"

const _checkWorker =async (payload)=>{
    return await axios.get(`/v1/hr/check-worker`, {params:payload.params})
}
const _index =async (payload)=>{
    return await axios.get(`/v1/hr/worker-positions`, {params:payload.params})
}

const _show =async (payload)=>{
    return await axios.get(`/v1/hr/worker-positions/${payload.id}/edit`, {params:payload.params})
}

const _preview =async (payload)=>{
    return await axios.get(`/v1/hr/worker-positions/${payload.id}`, {params:payload.params})
}
const _create = async (payload)=>{
    return await axios.post(`/v1/hr/workers`, payload.data)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/hr/workers/${payload.id}`, payload.data)
}




export default {
    _checkWorker,
    _index,
    _show,
    _create,
    _update,
    _preview,
}