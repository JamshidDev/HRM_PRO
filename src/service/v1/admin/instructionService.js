import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/admin/instructions`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/admin/instructions`, payload.data)
}

const _update = async (payload)=>{
    return await axios.post(`/v1/admin/instructions/${payload.id}`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/admin/instructions/${payload.id}`)
}

const _deletePhoto = async (payload)=>{
    return await axios.delete(`/v1/admin/instruction-photos/${payload.id}`)
}

export default {
    _index,
    _create,
    _update,
    _delete,
    _deletePhoto,
}