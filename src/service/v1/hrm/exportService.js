import axios from "@/service/index.js"

const _columns =async ()=>{
    return await axios.get(`/v1/hr/export/workers/columns`)
}

const _tasks =async ()=>{
    return await axios.get(`/v1/hr/export/tasks`)
}




export default {
    _columns,
    _tasks
}