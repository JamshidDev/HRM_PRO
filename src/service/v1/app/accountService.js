import axios from "../../index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/user/profile`)
}
const _update =async (payload)=>{
    return await axios.put(`/v1/user/update`, payload?.data)
}
const _logOut =async (payload)=>{
    return await axios.get(`/v1/user/logout`)
}

const _roles =async (payload)=>{
    return await axios.get(`/v1/user/roles`)
}
const _changeRole =async (payload)=>{
    return await axios.put(`/v1/user/change-organization`, payload?.data)
}
const _orgInfo =async (payload)=>{
    return await axios.get(`/v1/user/organization-info`)
}

const _updateOrgInfo =async (payload)=>{
    return await axios.put(`/v1/user/organization-info`, payload?.data)
}



export default {
    _index,
    _update,
    _logOut,
    _roles,
    _changeRole,
    _orgInfo,
    _updateOrgInfo,
}