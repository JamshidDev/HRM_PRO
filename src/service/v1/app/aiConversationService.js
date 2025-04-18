import axios from "../../index.js"

const conversation =async (payload)=>{
    return await axios.post(`/v1/ai/lawyer`, payload.data )
}

const questions =async (payload)=>{
    return await axios.get(`/v1/ai/questions`, {params:payload?.params} )
}

const list =async (payload)=>{
    return await axios.get(`/v1/ai/list`, {params:payload?.params} )
}
const like =async (payload)=>{
    return await axios.post(`/v1/ai/questions/${payload.id}/like`, payload.data )
}



export default {
    conversation,
    questions,
    list,
    like,
}