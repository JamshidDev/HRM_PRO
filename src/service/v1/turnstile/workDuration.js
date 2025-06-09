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


export default {
    _index,
    _logs,
    _latecomers,
}