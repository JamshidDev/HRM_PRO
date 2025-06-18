import axios from "@/service/index.js"

const _index = async (payload)=>{
    return await axios.get(`/v1/economist/statements`, {params:payload?.params})
}

const _show = async (payload)=>{
    return await axios.get(`/v1/economist/statements/${payload.id}`, {params:payload?.params})
}




export default {
    _index,
    _show,
}