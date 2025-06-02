import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/turnstile/worker-terminals`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/turnstile/worker-terminals`, payload.data)
}

const _worker_photos =async (payload)=>{
    return await axios.get(`/v1/turnstile/worker-photos`, {params:payload.params})
}

const _turnstile_terminals =async ()=>{
    return await axios.get( `/v1/turnstile/user-terminals`)
}

const _show =async (payload)=>{
    return await axios.get( `/v1/turnstile/worker-terminals/${payload.id}`)
}

const _detach = async (payload)=>{
    return await axios.post(`/v1/turnstile/detach-terminals/${payload.id}`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/turnstile/worker-terminals/${payload.id}`)
}




export default {
    _index,
    _create,
    _worker_photos,
    _turnstile_terminals,
    _show,
    _detach,
    _delete,
}