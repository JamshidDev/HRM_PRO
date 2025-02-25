import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/exam/worker-exams`, {params:payload.params})
}

const _start_exam = async (payload)=>{
    return await axios.post(`/v1/exam/worker-exams/${payload.id}/start`)
}

const _finish_exam = async (payload)=>{
    return await axios.get(`/v1/exam/worker-exams/${payload.id}/finished`, {headers: {'active_token': payload.token}})
}

const _continue_exam = async (payload)=>{
    return await axios.get(`/v1/exam/worker-exams/${payload.id}/continue`, {headers: {'active_token': payload.token}})
}

const _send_result = async (payload)=>{
    return await axios.post(`/v1/exam/worker-exams/${payload.id}/send-result/${payload.questionId}`,payload.data, {headers: {'active_token': payload.token}})
}


//
// const _create = async (payload)=>{
//     return await axios.post(`/v1/exam/categories/${payload.category_id}/questions`, payload.data)
// }
//
// const _update = async (payload)=>{
//     return await axios.put(`/v1/exam/categories/${payload.category_id}/questions/${payload.question_id}`, payload.data)
// }
//
// const _delete = async (payload)=>{
//     return await axios.delete(`/v1/exam/categories/${payload.id}/questions/${payload.id}`)
// }
//
// const _show = async (payload)=>{
//     return await axios.get(`/v1/exam/categories/${payload.category_id}/questions/${payload.question_id}`)
// }




export default {
    _index,
    _start_exam,
    _finish_exam,
    _continue_exam,
    _send_result
    // _create,
    // _update,
    // _delete,
    // _show
}