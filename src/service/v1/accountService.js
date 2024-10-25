import axios from "../index.js"

const _getAccount =async (payload)=>{
    return await axios.get(`/user/profile`)
}

export default {
    _getAccount
}