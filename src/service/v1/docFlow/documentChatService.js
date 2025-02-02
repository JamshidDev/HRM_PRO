import axios from "@/service/index.js"

const _messages =async (payload)=>{
    return await axios.get(`/v1/document/messages`, {params:payload.params})
}

const _users =async (payload)=>{
    return await axios.get(`/v1/document/users`, {params:payload.params})
}

const _sendMessage = async (payload)=>{
    return await axios.post(`/v1/document/messages`, payload.data)
}

const _readMessage = async (payload)=>{
    return await axios.post(`/v1/document/read`, payload.data)
}


const _delete = async (payload)=>{
    return await axios.delete(`/v1/document/messages/${payload.id}`)
}




export default {
    _messages,
    _sendMessage,
    _readMessage,
    _delete,
    _users,
}