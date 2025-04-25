import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/hr/vacations`, {params:payload.params})
}

const _vacationCalculate =async (payload)=>{
    return await axios.post(`/v1/hr/vacations/calculate`,payload.data, {params:payload.params})
}

const _reasonTypes =async (payload)=>{
    return await axios.get(`/v1/hr/enums/reason-types`, {params:payload.params})
}

const _lastOne =async (payload)=>{
    return await axios.post(`/v1/hr/vacations/create`, payload.data)
}




export default {
    _vacationCalculate,
    _reasonTypes,
    _index,
    _lastOne,
}