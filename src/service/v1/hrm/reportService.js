import axios from "@/service/index.js"

const _structure =async (payload)=>{
    return await axios.get(`/v1/hr/report/structure`, {params:payload?.params})
}

const _department=async (payload)=>{
    return await axios.get(`/v1/hr/report/departments`, {params:payload?.params})
}

const _position =async (payload)=>{
    return axios.get(`/v1/hr/report/department-positions`, {params:payload?.params})
}

const _worker =async (payload)=>{
    return await axios.get(`/v1/hr/report/worker-positions`, {params:payload?.params})
}

const _optimization =async (payload)=>{
    return await axios.get(`/v1/hr/report/optimization`, {params:payload?.params})
}

const _showPosition =async (payload)=>{
    return await axios.get(`/v1/hr/department-positions/${payload.id}`, {params:payload?.params})
}





export default {
    _structure,
    _department,
    _position,
    _worker,
    _optimization,
    _showPosition,
}