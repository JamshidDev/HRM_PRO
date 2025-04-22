import axios from "@/service/index.js"

const _columns =async ()=>{
    return await axios.get(`/v1/hr/export/workers/columns`)
}

const _tasks =async (payload)=>{
    return await axios.get(`/v1/hr/export/tasks`, {params: payload.params})
}

const _export_workers =async (payload)=>{
    return await axios.post(`/v1/hr/export/workers`, payload.data)
}

const _export_resume =async (payload)=>{
    return await axios.post(`/v1/hr/export/resumes`, payload.data)
}


export default {
    _columns,
    _tasks,
    _export_workers,
    _export_resume
}