import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/lms/exams`, {params:payload?.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/lms/exams/attach`, payload.data)
}

const _result =async (payload)=>{
    return await axios.get(`/v1/lms/exams/result`, {params:payload?.params})
}

// const _delete = async (payload)=>{
//     return await axios.delete(`/v1/lms/lessons/${payload.id}`)
// }






export default {
    _index,
    _create,
    _result,
}