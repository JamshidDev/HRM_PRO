import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/turnstile/work-duration`, {params:payload.params})
}

const _logs = async (payload)=>{
    return await axios.get(`/v1/turnstile/work-duration/logs`, {params:payload.params})
}

const _latecomers = async (payload)=>{
    return await axios.get(`/v1/turnstile/terminal-logs`, {params:payload?.params})
}
const _download = async (payload)=>{
    return await axios.get(`/v1/turnstile/terminal-logs/export`, {params:payload?.params})
}

const _HKIndex =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/work-durations`, {params:payload.params})
}
const _HKShow =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/work-durations/${payload.id}`, {params:payload.params})
}
const _HKShowEventsInDay =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/work-durations/${payload.id}/events`, {params:payload.params})
}


export default {
    _index,
    _logs,
    _latecomers,
    _download,
    _HKIndex,
    _HKShow,
    _HKShowEventsInDay
}