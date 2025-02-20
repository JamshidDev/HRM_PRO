import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`v1/hr/applications`, {params:payload.params})
}
const _generateUrl = async (payload)=>{
    return await axios.post(`v1/hr/applications/generate-url`, payload.data)
}




export default {
    _index,
    _generateUrl,
}