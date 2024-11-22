import axios from "@/service/index.js"



const _confirmationDocument = async (payload)=>{
    return await axios.post(`/v1/confirmation/document/signature`, payload.data)
}
const _documentBase64 = async (payload)=>{
    return await axios.get(`/v1/confirmation/document/base64`, {params:payload.params})
}






export default {
    _confirmationDocument,
    _documentBase64,
}