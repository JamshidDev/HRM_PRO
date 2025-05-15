import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/dashboard`, {params:payload.params})
}

const _birthdayDetail = async (payload)=>{
    return await axios.get(`/v1/hr/dashboard/birthdays`, {params:payload.params})
}


export default {
    _index,
    _birthdayDetail
}