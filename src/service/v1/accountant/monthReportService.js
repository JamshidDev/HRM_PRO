import axios from "@/service/index.js"

const _index = async (payload)=>{
    return await axios.get(`/v1/economist/statements`, {params:payload?.params})
}

const _show = async (payload)=>{
    return await axios.get(`/v1/economist/statements/${payload.id}`, {params:payload?.params})
}

const _template = async (payload)=>{
    return await axios.get(`/v1/economist/statement-example`, {params:payload?.params})
}

const _exportWithCode = async (payload)=>{
    return await axios.post(`/v1/economist/statements-export-with-codes`, payload?.data)
}

const _exportMultiple = async (payload)=>{
    return await axios.get(`/v1/economist/statements-multiple-workers`, {params:payload?.params})
}

const _exportByPosition = async (payload)=>{
    return await axios.get(`/v1/economist/statements-by-positions`, {params:payload?.params})
}




export default {
    _index,
    _show,
    _template,
    _exportWithCode,
    _exportMultiple,
    _exportByPosition,
}