import axios from "@/service/index.js"

const _enums =async (payload)=>{
    return await axios.get(`/v1/hr/enums`, {params:payload?.params})
}
const _enumAdmin =async (payload)=>{
    return await axios.get(`/v1/structure/enums`, {params:payload?.params})
}
const _organization =async (payload)=>{
    return await axios.get(`/v1/structure/organization-list`, {params:payload.params})
}
const _departments =async (payload)=>{
    return await axios.get(`/v1/hr/department-list`, {params:payload?.params})
}
const _departmentTree =async (payload)=>{
    return await axios.get(`/v1/hr/departments-tree`, {params:payload?.params})
}

const _docExample =async (payload)=>{
    return await axios.get(`/v1/hr/document-examples`, {params:payload?.params})
}

const _structure =async (payload)=>{
    return await axios.get(`/v1/structure`, {params:payload?.params})
}

export default {
    _enums,
    _organization,
    _departments,
    _structure,
    _enumAdmin,
    _docExample,
    _departmentTree,
}