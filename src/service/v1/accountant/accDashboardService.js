import axios from "@/service/index.js"

const _dashboard = async (payload)=>{
    return await axios.get(`/v1/economist/dashboard`, {params:payload?.params})
}




export default {
    _dashboard,
}