import axios from "@/service/index.js"

const _index =async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/access-levels`, {params:payload.params})
}

const _sync = async ()=>{
    return await axios.get(`/v1/turnstile/hik-central/access-levels-sync`)
}

const _org_access_levels = async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/organization-access-levels`, {params:payload?.params})
}

const _attach_org_access_levels = async (payload)=>{
    return await axios.post(`/v1/turnstile/hik-central/organization-access-levels-attach`, payload)
}

const _devices = async ()=>{
    return await axios.get(`/v1/turnstile/hik-central/devices`)
}

const _downloadDevices = async (payload)=>{
    return await axios.get(`/v1/turnstile/hik-central/devices`, {params:payload?.params, responseType: 'blob'})
}

const _refreshDevices = async ()=>{
    return await axios.get(`/v1/turnstile/hik-central/devices-refresh`)
}

const _departments = async ()=>{
    return await axios.get(`/v1/turnstile/hik-central/departments`)
}

const _update = async (payload)=>{
    return await axios.put(`/v1/turnstile/hik-central/access-levels/${payload.id}`, payload.data)
}



export default {
    _sync,
    _index,
    _org_access_levels,
    _attach_org_access_levels,
    _devices,
    _departments,
    _update,
    _refreshDevices,
    _downloadDevices,
}