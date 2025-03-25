import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/timesheet/${payload.id}/workers`, {params:payload?.params})
}

const _get_days = async (payload)=>{
    return await axios.get(`/v1/timesheet/${payload.id}/day-in-month`)
}

const _create = async (payload)=>{
    return await axios.post(`/v1/timesheet/${payload.id}/workers`, payload.data)
}

const _check_worker = async (pin)=>{
    return await axios.get(`/v1/timesheet/check-worker`, {params: {pin}})
}

export default {
    _index,
    _get_days,
    _create,
    _check_worker
}