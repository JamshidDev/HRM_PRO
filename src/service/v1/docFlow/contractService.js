import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`v1/hr/contracts`, {params:payload.params})
}
const _create = async (payload)=>{
    return await axios.post(`v1/hr/contracts`, payload.data)
}
const _delete = async (payload)=>{
    return await axios.delete(`v1/hr/contracts/${payload.id}`, payload.data)
}



export default {
    _index,
    _create,
    _delete,
}