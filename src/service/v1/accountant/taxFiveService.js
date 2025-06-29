import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/economist/tax-five-applications`, {params:payload?.params})
}

const _template =async (payload)=>{
    return await axios.get(`/v1/economist/tax-five-example`, {params:payload?.params})
}

const _show =async (payload)=>{
    return await axios.get(`/v1/economist/tax-five-applications/${payload.id}`, {params:payload?.params})
}




export default {
    _index,
    _template,
    _show,
}