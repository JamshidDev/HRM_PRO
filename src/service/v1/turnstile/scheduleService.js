import axios from "@/service/index.js"

const _generate =async (payload)=>{
    return await axios.post(`/v1/turnstile/schedule/generate`, payload.data)
}

const _create =async (payload)=>{
    return await axios.post(`/v1/turnstile/schedule/workers`, payload.data)
}

const _daysOfMonth =async (payload)=>{
    return await axios.get(`/v1/turnstile/schedule/day-in-month`, {params:payload?.params})
}

const _index =async (payload)=>{
    return await axios.get(`/v1/turnstile/schedule/workers`, {params:payload?.params})
}

const _updateTurnstile =async (payload)=>{
    return await axios.put(`/v1/turnstile/schedule/workers/${payload.id}`, payload.data)
}




export default {
    _generate,
    _create,
    _daysOfMonth,
    _index,
    _updateTurnstile,
}