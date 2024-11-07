import axios from "@/service/index.js"

const _enums =async (payload)=>{
    return await axios.get(`/v1/hr/enums`, {params:payload?.params})
}
const _organization =async (payload)=>{
    return await axios.get(`/v1/structure/organization-list`, {params:payload.params})
}





export default {
    _enums,
    _organization,
}