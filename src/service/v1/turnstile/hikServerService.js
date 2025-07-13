import axios from "@/service/index.js"

const _syncToServer =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/workers/sync-to-server`, {params:payload.params})
}

const _exportedJob = async (payload)=>{
    return await axios.post(`/v1/turnstile/hik-central/workers/exported-jobs`, payload.data)
}





export default {
    _syncToServer,
    _exportedJob,
}