import axios from "../index.js"

const _uploadImage =async (payload)=>{
    const files = payload?.files || []
    const formData = new FormData()
    files.forEach((file)=>{
        formData.append('files', file)
    })
    return await axios.post(`/common/image`, formData)
}


export default {
    _uploadImage,
}