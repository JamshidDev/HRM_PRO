import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/events`, {params:payload?.params})
}

const _dashboard =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/dashboard`, {params:payload?.params})
}

const _preview =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/dashboard/pereview`, {params:payload?.params})
}






export default {
    _index,
    _dashboard,
    _preview,
}