import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`v1/hr/commands`, {params:payload.params})
}
const _create = async (payload)=>{
    return await axios.post(`v1/hr/commands`, payload.data)
}

const _viewFile = async (payload)=>{
    return await axios.post(`v1/hr/commands`, payload.data, {responseType:'blob'})
}
const _delete = async (payload)=>{
    return await axios.delete(`v1/hr/commands/${payload.id}`)
}



export default {
    _index,
    _create,
    _delete,
    _viewFile,
}