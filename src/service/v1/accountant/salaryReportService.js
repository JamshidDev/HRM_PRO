import axios from "@/service/index.js"

const _indexByMonth =async (payload)=>{
    return await axios.get(`/v1/economist/statement-decoding`, {params:payload?.params})
}

const _indexByOrg =async (payload)=>{
    return await axios.get(`/v1/economist/statement-decoding-organizations`, {params:payload?.params})
}

const _show =async (payload)=>{
    return await axios.get(`/v1/economist/statements/${payload.id}`, {params:payload?.params})
}

const _example =async (payload)=>{
    return await axios.get(`/v1/economist/statement-example`, {params:payload?.params})
}




export default {
    _indexByMonth,
    _indexByOrg,
    _show,
    _example,
}