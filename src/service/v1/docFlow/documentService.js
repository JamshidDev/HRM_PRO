import axios from "@/service/index.js"

const _confirmationDocument = async (payload)=>{
    return await axios.post(`/v1/confirmation/document/signature`, payload.data)
}
const _documentBase64 = async (payload)=>{
    return await axios.get(`/v1/confirmation/document/base64`, {params:payload.params})
}
const _confirmationContract = async (payload)=>{
    return await axios.get(`/v1/confirmation/contracts`, {params:payload.params})
}
const _confirmationCommand = async (payload)=>{
    return await axios.get(`/v1/confirmation/commands`, {params:payload.params})
}
const _addQRCode = async (payload)=>{
    return await axios.get(`/v1/confirmation/document/base64`, {params:payload.params})
}
const _openDocument =async (payload)=>{
    return await axios.get(`/v1/document/show`, {params:payload.params})
}
const _history =async (payload)=>{
    return await axios.get(`/v1/document/history`, {params:payload.params})
}



export default {
    _confirmationDocument,
    _documentBase64,
    _confirmationContract,
    _addQRCode,
    _openDocument,
    _history,
    _confirmationCommand,
}