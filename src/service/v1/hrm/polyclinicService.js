import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/polyclinics`, {params:payload?.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/hr/polyclinics`, payload.data)
}


const _delete = async (payload)=>{
    return await axios.delete(`/v1/hr/polyclinics/${payload.id}`)
}





export default {
    _index,
    _create,
    _delete,
}