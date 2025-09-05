import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/lms/groups`, {params:payload?.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/lms/generate-groups`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.post(`/v1/lms/detach-workers-in-group`, payload.data)
}

const _groupWorkers =async (payload)=>{
    return await axios.get(`/v1/lms/group-workers`, {params:payload?.params})
}





export default {
    _index,
    _create,
    _groupWorkers,
    _delete,
}