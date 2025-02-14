import axios from "@/service/index.js"

const _create = async (payload)=>{
    return await axios.post(`/v1/structure/upload`, payload)
}

export default {
    _create,
}