import axios from "@/service/index.js"

const _index =async ()=>{
    return await axios.get(`/v1/hr/organization-documents`)
}

const _store =async (payload)=>{
    return await axios.post(`/v1/hr/organization-documents`, payload.data)
}

const _update =async (payload)=>{
    return await axios.post(`/v1/hr/organization-documents`, payload.data)
}

const _delete =async (payload)=>{
    return await axios.delete(`/v1/hr/organization-documents/${payload.id}`)
}


export default {
    _index,
    _store,
    _update,
    _delete
}