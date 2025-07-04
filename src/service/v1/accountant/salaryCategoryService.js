import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/economist/worker-categories`, {params:payload?.params})
}

const _byOrganization =async (payload)=>{
    return await axios.get(`/v1/economist/worker-category-organizations`, {params:payload?.params})
}

const _store =async (payload)=>{
    return await axios.post(`/v1/economist/worker-categories`, payload.data)
}

const _update =async (payload)=>{
    return await axios.put(`/v1/economist/worker-categories/${payload.id}`, payload.data)
}

const _delete =async (payload)=>{
    return await axios.delete(`/v1/economist/worker-categories/${payload.id}`)
}




export default {
    _index,
    _byOrganization,
    _update,
    _store,
    _delete,
}