import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/timesheet/user-departments`, {params:payload.params})
}

const _show = async (payload)=>{
    return await axios.get(`/v1/timesheet/user-departments/${payload.id}`)
}

const _attach_user = async (payload)=>{
    return await axios.post(`/v1/timesheet/user-departments/${payload.id}/attach`, payload.data)
}

const _deattach_user = async (payload)=>{
    return await axios.post(`/v1/timesheet/user-departments/${payload.id}/deattach`, payload.data)
}



export default {
    _index,
    _show,
    _attach_user,
    _deattach_user
}