import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/vacation-schedules`, {params:payload?.params})
}

const _notIncludes =async (payload)=>{
    return await axios.get(`/v1/hr/vacation-schedules-not-included`,{params:payload?.params})
}

const _create =async (payload)=>{
    return await axios.post(`/v1/hr/vacation-schedules`, payload.data)
}

const _update =async (payload)=>{
    return await axios.put(`/v1/hr/vacation-schedules/${payload.id}`, payload.data)
}

const _delete =async (payload)=>{
    return await axios.delete(`/v1/hr/vacation-schedules/${payload.id}`)
}


export default {
    _index,
    _create,
    _update,
    _delete,
    _notIncludes,
}