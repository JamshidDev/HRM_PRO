import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/worker-relatives`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/hr/worker-relatives`, payload.data)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/hr/worker-relatives/${payload.id}`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/hr/worker-relatives/${payload.id}`)
}

const _sortable = async (payload)=>{
    return await axios.put(`/v1/hr/worker-relatives-sortable`, payload.data)
}




export default {
    _index,
    _create,
    _update,
    _delete,
    _sortable,
}