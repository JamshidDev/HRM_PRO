import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/timesheet/worker-departments`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/timesheet/worker-departments/attach`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/timesheet/worker-departments/${payload.id}`)
}


export default {
    _index,
    _create,
    _delete
}