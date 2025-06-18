import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/economist/tax-four-applications`, {params:payload?.params})
}

const _template =async (payload)=>{
    return await axios.get(`/v1/economist/tax-four-example`, {params:payload?.params})
}

const _show =async (payload)=>{
    return await axios.get(`/v1/economist/tax-four-applications/${payload.id}`, {params:payload?.params})
}




export default {
    _index,
    _template,
    _show,
}