import axios from "@/service/index.js"

const _enums =async (payload)=>{
    return await axios.get(`/v1/hr/enums`, {params:payload?.params})
}
const _enumAdmin =async (payload)=>{
    return await axios.get(`/v1/structure/enums`, {params:payload?.params})
}
const _enumExam =async (payload)=>{
    return await axios.get(`/v1/exam/enums`, {params:payload?.params})
}

const _examCategory =async (payload)=>{
    return await axios.get(`/v1/exam/categories`, {params:payload?.params})
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

const _allDepartmentTree =async (payload)=>{
    return await axios.get(`/v1/hr/get-departments-tree`, {params:payload?.params})
}

const _docExample =async (payload)=>{
    return await axios.get(`/v1/hr/document-examples`, {params:payload?.params})
}

const _structure =async (payload)=>{
    return await axios.get(`/v1/structure`, {params:payload?.params})
}

const _allStructure =async (payload)=>{
    return await axios.get(`/v1/structure/all`, {params:payload?.params})
}

const _commandTypes =async (payload)=>{
    return await axios.get(`/v1/hr/enums/command-types`, {params:payload?.params})
}
const _contractAddition =async (payload)=>{
    return await axios.get(`/v1/hr/enums/contract-additional-types`, {params:payload?.params})
}
const _directors =async (payload)=>{
    return await axios.get(`/v1/worker-application/directors`, {params:payload?.params})
}
const _workerApplicationEnum =async (payload)=>{
    return await axios.get(`/v1/worker-application/enums`, {params:payload?.params})
}

const _departmentByOrganizations =async (payload)=>{
    return await axios.get(`v1/hr/get-departments`, {params:payload?.params})
}

const _allPosition =async (payload)=>{
    return await axios.get(`/v1/hr/get-department-positions`, {params:payload?.params})
}

export default {
    _enums,
    _organization,
    _departments,
    _structure,
    _enumAdmin,
    _docExample,
    _departmentTree,
    _enumExam,
    _commandTypes,
    _contractAddition,
    _examCategory,
    _directors,
    _workerApplicationEnum,
    _departmentByOrganizations,
    _allStructure,
    _allDepartmentTree,
    _allPosition,
}