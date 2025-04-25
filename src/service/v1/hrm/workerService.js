import axios from "@/service/index.js"

const _checkWorker =async (payload)=>{
    return await axios.get(`/v1/hr/check-worker`, {params:payload.params})
}
const _index =async (payload)=>{
    return await axios.get(`/v1/hr/worker-positions`, {params:payload.params})
}
const _search =async (payload)=>{
    return await axios.get(`/v1/hr/search-workers`, {params:payload.params})
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
const _resume =async (payload)=>{
    return await axios.get(`/v1/hr/worker-positions/${payload.id}/resume-download`,{responseType:"blob"}, {params:payload.params})
}

const _deleteRole = async (payload)=>{
    return await axios.put(`/v1/hr/worker-positions/${payload.id}/edit/detach-role`, payload.data)
}

const _storeRole = async (payload)=>{
    return await axios.post(`/v1/hr/worker-positions/${payload.id}/edit/attach-role`, payload.data)
}

const _userRole =async (payload)=>{
    return await axios.get(`/v1/hr/users`, {params:payload.params})
}




export default {
    _checkWorker,
    _index,
    _show,
    _create,
    _update,
    _preview,
    _search,
    _resume,
    _deleteRole,
    _storeRole,
    _userRole,
}