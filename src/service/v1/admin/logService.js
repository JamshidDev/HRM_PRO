import axios from "@/service/index.js"

const _actionLog =async (payload)=>{
    return await axios.get(`/v1/admin/activity-logs`, {params:payload.params})
}
const _authLog =async (payload)=>{
    return await axios.get(`/v1/admin/authentication-logs`, {params:payload.params})
}




export default {
    _actionLog,
    _authLog,
}