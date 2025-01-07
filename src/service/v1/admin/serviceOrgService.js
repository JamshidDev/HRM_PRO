import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/structure/organization-services`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/structure/organization-services`, payload.data)
}





export default {
    _index,
    _create,
}