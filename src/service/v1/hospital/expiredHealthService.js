import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/med/workers`, {params:payload?.params})
}

const _organization =async (payload)=>{
    return await axios.get(`/v1/med/organizations`, {params:payload?.params})
}





export default {
    _index,
    _organization,
}