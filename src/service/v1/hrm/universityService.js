import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/worker-universities`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/hr/worker-universities`, payload.data)
}

const _update = async (payload)=>{
    return await axios.post(`/v1/hr/worker-universities/${payload.id}`, payload.data, {params:payload.params})
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/hr/worker-universities/${payload.id}`)
}




export default {
    _index,
    _create,
    _update,
    _delete,
}