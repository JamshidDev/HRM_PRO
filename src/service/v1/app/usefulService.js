import axios from "../../index.js"


const _leaders =async ()=>{
    return await axios.get(`/v1/useful/leaders`)
}
const _codex =async ()=>{
    return await axios.get(`/v1/useful/codex`)
}



export default {
    _leaders,
    _codex,
}