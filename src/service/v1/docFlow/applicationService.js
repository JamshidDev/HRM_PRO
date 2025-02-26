import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`v1/hr/applications`, {params:payload.params})
}
const _generateUrl = async (payload)=>{
    return await axios.post(`v1/hr/applications/generate-url`, payload.data, {params:payload.params})
}
const _confIndex =async (payload)=>{
    return await axios.get(`v1/confirmation/applications`, {params:payload.params})
}
const _checkApplication =async (payload)=>{
    return await axios.post(`v1/document/application-confirmation`,payload.data, {params:payload.params})
}




export default {
    _index,
    _generateUrl,
    _confIndex,
    _checkApplication,
}