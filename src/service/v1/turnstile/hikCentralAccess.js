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

export default {
    _sync,
    _index,
    _org_access_levels,
    _attach_org_access_levels
}