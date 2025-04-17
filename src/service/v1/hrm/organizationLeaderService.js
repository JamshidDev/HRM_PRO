import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/leaders`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/hr/leaders`, payload.data)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/hr/leaders/${payload.id}`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/hr/leaders/${payload.id}`)
}




export default {
    _index,
    _create,
    _update,
    _delete,
}