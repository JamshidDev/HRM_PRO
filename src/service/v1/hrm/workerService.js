import axios from "@/service/index.js"

const _checkWorker =async (payload)=>{
    return await axios.get(`/v1/hr/check-worker`, {params:payload.params})
}
const _index =async (payload)=>{
    return await axios.get(`/v1/hr/worker-positions`, {params:payload.params})
}

const _show =async (payload)=>{
    return await axios.get(`/v1/hr/worker-positions/${payload.id}`, {params:payload.params})
}







export default {
    _checkWorker,
    _index,
    _show,
}