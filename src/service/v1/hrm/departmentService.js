import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/departments`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/hr/departments`, payload.data)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/hr/departments/${payload.id}`, payload.data)
}

const _show = async (payload)=>{
    return await axios.get(`/v1/hr/departments/${payload.id}`)
}

const _level = async (payload)=>{
    return await axios.get(`/v1/hr/department-levels`,{params:payload?.params})
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/hr/departments/${payload.id}`)
}




export default {
    _index,
    _create,
    _update,
    _delete,
    _show,
    _level,
}