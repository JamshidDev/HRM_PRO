import axios from "../index.js"

const _getAccount =async (payload)=>{
    return await axios.get(`/account`)
}

export default {
    _getAccount
}