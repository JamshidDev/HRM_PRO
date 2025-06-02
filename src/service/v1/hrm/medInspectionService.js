import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/med/workers`, {params:payload?.params})
}

const _polyclinics =async (payload)=>{
    return await axios.get(`/v1/med/polyclinics`, {params:payload?.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/med/send-to-med`, payload.data)
}





export default {
    _index,
    _create,
    _polyclinics,
}