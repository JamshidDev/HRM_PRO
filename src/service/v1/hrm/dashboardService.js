import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/dashboard`, {params:payload.params})
}

const _birthdayDetail = async (payload)=>{
    return await axios.get(`/v1/hr/dashboard/birthdays`, {params:payload.params})
}

const _ageDetail = async (payload)=>{
    return await axios.get(`/v1/hr/dashboard/age`, {params:payload.params})
}

const _educationDetail = async (payload)=>{
    return await axios.get(`/v1/hr/dashboard/educations`, {params:payload.params})
}


export default {
    _index,
    _birthdayDetail,
    _ageDetail,
    _educationDetail
}