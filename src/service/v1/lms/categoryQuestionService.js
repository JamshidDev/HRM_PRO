import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/exam/categories/${payload.id}/questions`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/exam/categories/${payload.category_id}/questions`, payload.data)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/exam/categories/${payload.category_id}/questions/${payload.question_id}`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/exam/categories/${payload.id}/questions/${payload.id}`)
}

const _show = async (payload)=>{
    return await axios.get(`/v1/exam/categories/${payload.category_id}/questions/${payload.question_id}`)
}




export default {
    _index,
    _create,
    _update,
    _delete,
    _show
}