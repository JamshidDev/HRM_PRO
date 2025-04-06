import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/structure/quotes`, {params:payload?.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/structure/quotes`, payload?.data)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/structure/quotes/${payload?.id}`, payload?.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/structure/quotes/${payload?.id}`)
}

const _random =async (payload)=>{
    return await axios.get(`/v1/quote`, {params:payload?.params})
}




export default {
    _index,
    _create,
    _update,
    _delete,
    _random,
}