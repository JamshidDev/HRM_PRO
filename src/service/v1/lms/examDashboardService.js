import axios from "@/service/index.js"

const _worker_statistics =async (payload)=>{
    return await axios.get(`/v1/exam/worker-exams/statistics`, {params:payload.params})
}

export default {
    _worker_statistics
}