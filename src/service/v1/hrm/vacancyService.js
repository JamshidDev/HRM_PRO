import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/vacancy/positions`, {params:payload.params})
}

const _store =async (payload)=>{
    return await axios.post(`/v1/hr/vacancy/positions`, payload?.data)
}

const _vacancyPosition =async (payload)=>{
    return await axios.get(`/v1/hr/vacancy/positions`, {params:payload.params})
}






export default {
    _index,
    _store,
    _vacancyPosition,
}