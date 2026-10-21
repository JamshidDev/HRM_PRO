import axios from '@/service/index.js'

// Video qo'llanmalar: ko'rish (hamma) + admin boshqaruvi. Video MinIO'ga to'g'ridan-to'g'ri yuklanadi.
const _index = async (payload) => axios.get(`/v1/video-guides`, { params: payload?.params })
const _show = async (payload) => axios.get(`/v1/video-guides/${payload.id}`)
const _view = async (payload) => axios.post(`/v1/video-guides/${payload.id}/view`)

const _adminIndex = async (payload) => axios.get(`/v1/admin/video-guides`, { params: payload?.params })
const _adminShow = async (payload) => axios.get(`/v1/admin/video-guides/${payload.id}`)
const _adminCreate = async (payload) => axios.post(`/v1/admin/video-guides`, payload.data)
const _adminUpdate = async (payload) => axios.put(`/v1/admin/video-guides/${payload.id}`, payload.data)
const _adminDelete = async (payload) => axios.delete(`/v1/admin/video-guides/${payload.id}`)
const _uploadUrl = async (payload) => axios.post(`/v1/admin/video-guides/upload-url`, payload.data)

// Faylni imzolangan havola bo'yicha MinIO'ga PUT qiladi; onProgress(0..1).
const _putToStorage = (url, file, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total)
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`upload ${xhr.status}`)))
    xhr.onerror = () => reject(new Error('upload network error'))
    xhr.send(file)
  })

export default {
  _index,
  _show,
  _view,
  _adminIndex,
  _adminShow,
  _adminCreate,
  _adminUpdate,
  _adminDelete,
  _uploadUrl,
  _putToStorage
}
