import axios from "../index.js"

const _getCategories =async (payload)=>{
    return await axios.get(`/category`, {params:payload?.params})
}
const _createCategory =async (payload)=>{
    return await axios.post(`/category`, payload.data)
}

const _detailsCategories =async (payload)=>{
    return await axios.get(`/category/${payload.categoryId}`, {params:payload?.params})
}
const _updateCategory =async (payload)=>{
    return await axios.put(`/category/${payload.categoryId}`, payload.data)
}

const _deleteCategory =async (payload)=>{
    return await axios.delete(`/category/${payload.categoryId}`, )
}


export default {
    _getCategories,
    _createCategory,
    _detailsCategories,
    _updateCategory,
    _deleteCategory,
}