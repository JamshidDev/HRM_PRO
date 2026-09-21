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

// Tabel KORXONASIGA biriktirilgan tabelchilar (+ har birining qulf holati).
const _timekeepers = async (payload) => {
  return await axios.get(`/v1/timesheet/${payload.id}/timekeepers`, {
    params: payload?.params
  })
}

// Tabelchi qulflari — SHU tabel (korxona + oy) uchun.
const _timekeeper_locks = async (payload) => {
  return await axios.get(`/v1/timesheet/${payload.id}/timekeeper-locks`)
}

const _set_timekeeper_lock = async (payload) => {
  return await axios.post(`/v1/timesheet/${payload.id}/timekeeper-lock`, payload.data)
}

export default {
  _index,
  _get_days,
  _create,
  _check_worker,
  _auto_calc,
  _day_detail,
  _auto_calc_rules,
  _timekeepers,
  _timekeeper_locks,
  _set_timekeeper_lock
}
