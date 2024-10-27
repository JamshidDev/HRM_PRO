import axios from "../index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/admin/users`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/admin/assign-role`, payload.data)
}




export default {
    _index,
    _create,
}