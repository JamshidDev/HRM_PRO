import axios from "../index.js"

const _login =async (payload)=>{
    return await axios.post(`/auth/pair`, payload.data)
}

const _register = async (payload)=>{
    return await axios.post(`/account`, payload.data)
}

const _refreshToken = async (payload)=>{
    return await axios.post('/auth/refresh', payload.data)
}



export default {
    _login,
    _register,
    _refreshToken,
}