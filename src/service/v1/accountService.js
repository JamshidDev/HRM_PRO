import axios from "../index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/user/profile`)
}
const _update =async (payload)=>{
    return await axios.put(`/v1/user/update`, payload?.data)
}
const _logOut =async (payload)=>{
    return await axios.get(`/v1/user/logout`)
}

export default {
    _index,
    _update,
    _logOut,
}