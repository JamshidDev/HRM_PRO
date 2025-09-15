import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/sync`, {params:payload.params})
}

const _show =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/sync/${payload.id}`, {params:payload.params})
}


// const _update = async (payload)=>{
//     return await axios.put(`/v1/turnstile/terminals/${payload.id}`, payload.data)
// }
//
// const _delete = async (payload)=>{
//     return await axios.delete(`/v1/turnstile/terminals/${payload.id}`)
// }




export default {
    _index,
    _show,
}