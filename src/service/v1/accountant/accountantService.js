import axios from "@/service/index.js"

const _enum =async (payload)=>{
    return await axios.get(`/v1/economist/enums`, {params:payload?.params})
}
const _structure =async (payload)=>{
    return await axios.get(`/v1/economist/structure`, {params:payload?.params})
}

const _index =async (payload)=>{
    return await axios.get(`/v1/economist/upload-histories`, {params:payload?.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/economist/upload`, payload.data)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/structure/countries/${payload.id}`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/structure/countries/${payload.id}`)
}




export default {
    _index,
    _create,
    _update,
    _delete,
    _enum,
    _structure,
}