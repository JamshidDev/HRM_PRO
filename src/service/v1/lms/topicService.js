import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/exam/topics`, {params:payload.params})
}

const _show =async (payload)=>{
    return await axios.get(`/v1/exam/topics/${payload.id}`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/exam/topics`, payload.data)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/exam/topics/${payload.id}`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/exam/topics/${payload.id}`)
}




export default {
    _index,
    _create,
    _update,
    _delete,
    _show,
}