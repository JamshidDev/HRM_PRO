import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/exam/topics/${payload.id}/exams`, {params:payload.params})
}

const _create = async (payload)=>{
    return await axios.post(`/v1/exam/topics/${payload.id}/exams`, payload.data)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/exam/topics/${payload.id}/exams/${payload.exam_id}`, payload.data)
}

const _delete = async (payload)=>{
    return await axios.delete(`/v1/exam/topics/${payload.id}/exams/${payload.exam_id}`)
}

const _show = async (payload)=>{
    return await axios.get(`/v1/exam/topics/${payload.id}/exams/${payload.exam_id}`)
}

const _attach_category = async (payload)=>{
    return await axios.post(`/v1/exam/topics/${payload.id}/exams/${payload.exam_id}/attach-question`, payload.data)
}

const _get_attached_category = async (payload)=>{
    return await axios.get(`/v1/exam/topics/${payload.id}/exams/${payload.exam_id}/attach-question`)
}

export default {
    _index,
    _create,
    _update,
    _delete,
    _show,
    _attach_category,
    _get_attached_category
}