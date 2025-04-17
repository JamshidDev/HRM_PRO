import axios from "../../index.js"

const conversation =async (payload)=>{
    return await axios.post(`/v1/ai/lawyer`, payload.data )
}

const questions =async (payload)=>{
    return await axios.get(`/v1/ai/questions`, payload.data )
}

const list =async (payload)=>{
    return await axios.get(`/v1/ai/list`, payload.data )
}



export default {
    conversation,
    questions,
    list,
}