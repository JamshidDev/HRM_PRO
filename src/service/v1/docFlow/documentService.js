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
const _confirmationAdContract = async (payload)=>{
    return await axios.get(`/v1/confirmation/contract-additional`, {params:payload.params})
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
const _generateLink =async (payload)=>{
    return await axios.get(`/v1/document/generate-url`, {params:payload.params})
}

const _signature =async (payload)=>{
    return await axios.post(`/v1/document/signature`, payload.data, {params:payload.params})
}



export default {
    _confirmationDocument,
    _documentBase64,
    _addQRCode,
    _openDocument,
    _history,
    _confirmationContract,
    _confirmationCommand,
    _confirmationAdContract,
    _generateLink,
    _signature,
}