import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/dashboard`, {params:payload.params})
}

const _indexTwo =async (payload)=>{
    return await axios.get(`/v1/hr/dashboard-two`, {params:payload?.params})
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

const _passportDetail = async (payload)=>{
    return await axios.get(`/v1/hr/dashboard/passport`, {params:payload.params})
}

const _medDetail = async (payload)=>{
    return await axios.get(`/v1/hr/dashboard/meds`, {params:payload?.params})
}

const _pensionDetail = async (payload)=>{
    return await axios.get(`/v1/hr/dashboard/pension`, {params:payload?.params})
}

const _disciplinaryDetail = async (payload)=>{
    return await axios.get(`/v1/hr/dashboard/disciplinary-actions`, {params:payload?.params})
}

const _incentiveDetail = async (payload)=>{
    return await axios.get(`/v1/hr/dashboard/incentive-actions`, {params:payload?.params})
}


export default {
    _disciplinaryDetail,
    _incentiveDetail,
    _index,
    _birthdayDetail,
    _ageDetail,
    _educationDetail,
    _passportDetail,
    _pensionDetail,
    _medDetail,
    _indexTwo,
}