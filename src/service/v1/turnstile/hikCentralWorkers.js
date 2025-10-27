import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/workers`, {params:payload.params})
}

const _add_worker = async (payload)=>{
    return await axios.post(`/v1/turnstile/hik-central/workers/add`, payload)
}

const _refresh_worker = async(payload)=>{
    return await axios.post(`/v1/turnstile/hik-central/workers/refresh`, payload.data)
}

const _access_levels = async (params)=>{
    return await axios.get(`/v1/turnstile/hik-central/workers/access-levels`, {params})
}

const _updateFace = async (payload)=>{
    return await axios.post(`/v1/turnstile/hik-central/workers/update-face`, payload?.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/turnstile/hik-central/workers/destroy/${payload.id}`)
}


export default {
    _index,
    _add_worker,
    _refresh_worker,
    _access_levels,
    _updateFace,
    _delete,
}