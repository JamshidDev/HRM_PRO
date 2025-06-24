import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/vacancy`, {params:payload.params})
}

const _show =async (payload)=>{
    return await axios.get(`/v1/hr/vacancy/${payload.id}`, {params:payload.params})
}

const _store =async (payload)=>{
    return await axios.post(`/v1/hr/vacancy/positions`, payload?.data)
}

const _update =async (payload)=>{
    return await axios.put(`/v1/hr/vacancy/${payload.id}`, payload?.data)
}

const _delete =async (payload)=>{
    return await axios.delete(`/v1/hr/vacancy/${payload.id}`)
}

const _vacancyPosition =async (payload)=>{
    return await axios.get(`/v1/hr/vacancy/positions`, {params:payload.params})
}






export default {
    _index,
    _store,
    _show,
    _vacancyPosition,
    _update,
    _delete,
}