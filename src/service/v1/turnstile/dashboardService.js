import axios from "@/service/index.js"

const _dashboard =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/dashboard`, {params:payload.params})
}

const _statDashboard =async (payload)=>{
    return await axios.get(`/v1/turnstile/schedule/stats`, {params:payload.params})
}





export default {
    _dashboard,
    _statDashboard,
}