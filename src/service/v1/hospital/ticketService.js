import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/med/hospital/tickets`, {params:payload?.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/med/hospital/tickets-attach`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/med/hospital/tickets-attach/${payload.id}`, payload.data)
}

const _commission =async (payload)=>{
    return await axios.get(`/v1/med/hospital/tickets/${payload.id}/commissions`, {params:payload?.params})
}

const _confirm = async (payload)=>{
    return await axios.post(`/v1/med/hospital/tickets/${payload.id}/confirm`, payload.data)
}






export default {
    _index,
    _create,
    _delete,
    _commission,
    _confirm,
}