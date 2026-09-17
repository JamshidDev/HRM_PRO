import axios from '@/service/index.js'

const _index = async (payload) => {
  return await axios.get(`/v1/timesheet/${payload.id}/workers`, { params: payload?.params })
}

const _get_days = async (payload) => {
  return await axios.get(`/v1/timesheet/${payload.id}/day-in-month`)
}

const _create = async (payload) => {
  return await axios.post(`/v1/timesheet/${payload.id}/workers`, payload.data)
}

const _check_worker = async (pin) => {
  return await axios.get(`/v1/timesheet/check-worker`, { params: { pin } })
}

// Auto hisoblash — joriy sahifadagi xodimlar uchun kunlik qiymatlarni
// qaytaradi (bazaga YOZMAYDI, «Saqlash» bosilganda ketadi).
const _auto_calc = async (payload) => {
  return await axios.post(`/v1/timesheet/${payload.id}/auto-calc`, payload.data)
}

// Bitta kun tafsiloti — katakcha ustidagi tugma shuni ochadi.
const _day_detail = async (payload) => {
  return await axios.get(`/v1/timesheet/${payload.id}/day-detail`, { params: payload.params })
}

// Hisoblash qoidalari — «Auto» yonidagi tugma modalidagi jadval uchun.
const _auto_calc_rules = async () => {
  return await axios.get(`/v1/timesheet/auto-calc-rules`)
}

export default {
  _index,
  _get_days,
  _create,
  _check_worker,
  _auto_calc,
  _day_detail,
  _auto_calc_rules
}
