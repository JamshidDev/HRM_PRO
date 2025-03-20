import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/timesheet/${payload.id}/confirmations`)
}


const _create = async (payload)=>{
    return await axios.post(`/v1/timesheet/${payload.id}/confirmations`, payload.data)
}

export default {
    _index,
    _create,
}