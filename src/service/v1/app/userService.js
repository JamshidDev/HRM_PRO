import axios from "../../index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/admin/users`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/admin/assign-role`, payload.data)
}

const _myRoles =async (payload)=>{
    return await axios.get(`/v1/admin/users/${payload?.id}/roles`, {params:payload.params})
}

const _update = async (payload)=>{
    return await axios.put(`/v1/admin/users/${payload?.id}/roles/detach`, payload.data)
}

const _loginByIdToSystem = async (payload)=>{
    return await axios.get(`/v1/admin/users/${payload?.id}/login`, {params:payload.params})
}





export default {
    _index,
    _create,
    _myRoles,
    _update,
    _loginByIdToSystem,
}