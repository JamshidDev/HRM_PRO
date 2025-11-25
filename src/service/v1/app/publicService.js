import axios from "../../index.js"
import axiosOrigin from "axios"

const apiUrl = import.meta.env.VITE_API_URL
const  baseURL = `${apiUrl}/api`

const _downloadDocument = async (payload)=>{
    return await axios.get(`/v1/documents/exams/${payload.id}`)
}

const _getDetailExam = async (payload)=>{
    return await axios.get(`/v1/exam/worker-exams-results/${payload.id}`, {
        headers:{
            Authorization:'Bearer '+payload?.token,
        }
    })
}

const _loginToSystem = async (payload)=>{
    return await axiosOrigin.post(baseURL +`/auth/login`, payload.data)

}




export default {
    _downloadDocument,
    _getDetailExam,
    _loginToSystem,
}