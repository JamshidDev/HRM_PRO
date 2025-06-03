import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/worker-meds`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/hr/worker-meds`, payload.data)
}

const _show =async (payload)=>{
    return await axios.get(`/v1/hr/worker-meds/${payload.id}/edit`, {params:payload?.params})
}

const _update = async (payload)=>{
    return await axios.post(`/v1/hr/worker-meds/${payload.id}`, payload.data, {params:payload?.params})
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/hr/worker-meds/${payload.id}`)
}

const _dashboard =async (payload)=>{
    return await axios.get(`/v1/med/dashboard`, {params:payload?.params})
}




export default {
    _index,
    _create,
    _update,
    _delete,
    _show,
    _dashboard,
}