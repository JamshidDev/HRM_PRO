import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/turnstile/workers`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/turnstile/workers`, payload.data)
}

const _worker_photos =async (payload)=>{
    return await axios.get(`/v1/turnstile/worker-photos`, {params:payload.params})
}

const _turnstile_devices =async ()=>{
    return await axios.get( `/v1/turnstile/user-terminals`)
}

// const _update = async (payload)=>{
//     return await axios.put(`/v1/turnstile/workers/${payload.id}`, payload.data)
// }

const _delete = async (payload)=>{
    return await axios.delete(`/v1/turnstile/workers/${payload.id}`)
}




export default {
    _index,
    _create,
    _worker_photos,
    _delete,
    _turnstile_devices
    // _update,
    // _delete,
}