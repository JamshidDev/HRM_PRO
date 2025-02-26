import axios from "@/service/index.js"

const _vacationCalculate =async (payload)=>{
    return await axios.post(`/v1/hr/vacations/calculate`,payload.data, {params:payload.params})
}




export default {
    _vacationCalculate,
}