import axios from "../index.js"

const _login =async (payload)=>{
    console.log(payload)
    return await axios.post(`/auth/pair`, payload.data)
}



export default {
    _login
}