import axios from '@/service/index.js'

const _enum = async (payload) => {
  return await axios.get(`/v1/economist/enums`, { params: payload?.params })
}
const _structure = async (payload) => {
  return await axios.get(`/v1/economist/structure`, { params: payload?.params })
}

const _index = async (payload) => {
  return await axios.get(`/v1/economist/upload-histories`, { params: payload?.params })
}

const _create = async (payload) => {
  return await axios.post(`/v1/economist/upload`, payload.data)
}

// Oylik hisobotni 1C dan yuklash (fayl yo'q — salary-1c da tortilgan ma'lumot).
// payload.config — ommaviy yuklashda { silentError: true } uzatiladi (har org uchun
// toast chiqmasin; xatolar modalda alohida ko'rsatiladi).
const _createFromOnes = async (payload) => {
  return await axios.post(`/v1/economist/upload/from-1c`, payload.data, payload.config)
}

// 1C dan ommaviy yuklash uchun — shu davrda tortilgan korxonalar ro'yxati.
// economist-uploads ruxsati ostida (salary-1c-access dan mustaqil).
const _onesOrgs = async (payload) => {
  return await axios.get(`/v1/economist/upload/ones-orgs`, { params: payload?.params })
}

// INPS 4/5-ilova va to'lovlar (type 2/3/4) bulk 1C tortishi uchun 1C kodi bor
// korxonalar (davrga bog'liq emas — 1c-zup to'g'ridan-to'g'ri).
const _reportOrgs = async () => {
  return await axios.get(`/v1/economist/upload/report-orgs`)
}

const _update = async (payload) => {
  return await axios.put(`/v1/structure/countries/${payload.id}`, payload.data)
}

const _delete = async (payload) => {
  return await axios.delete(`/v1/structure/countries/${payload.id}`)
}

const _confirm = async (payload) => {
  return await axios.post(`/v1/economist/upload-histories/confirm`, payload.data)
}

const _cancelConfirm = async (payload) => {
  return await axios.post(`/v1/economist/upload-histories/cancel-confirm`, payload.data)
}

const _updateStatus = async (payload) => {
  return await axios.post(`/v1/economist/upload-statuses`, payload.data)
}

// Yuklangan hisobotni o'chirish (upload id bo'yicha) — ma'lumot satrlari + soft-delete.
const _deleteUpload = async (payload) => {
  return await axios.delete(`/v1/economist/upload/${payload.id}`)
}

// Hisobot yuklash holati — tanlangan oy uchun korxonalar kesimida (yuklagan/yuklamagan).
const _reportStatus = async (payload) => {
  return await axios.get(`/v1/economist/upload-report-status`, { params: payload?.params })
}
// Hisobot yuklash holati — Excel eksport (blob).
const _reportStatusExport = async (payload) => {
  return await axios.get(`/v1/economist/upload-report-status/export`, {
    params: payload?.params,
    responseType: 'blob'
  })
}

// Bitta korxonaning oy oralig'idagi 4 turdagi hisobotlari — ZIP (blob).
// Mavjud eksport strukturasi (reportStatusExport): blob → blobFileDownload.
const _reportsZip = async (payload) => {
  return await axios.get(`/v1/economist/upload/reports-zip`, {
    params: payload?.params,
    responseType: 'blob'
  })
}

// «1C dan ommaviy yuklash» xatolarini Excel (.xlsx) qilib yuklab olish.
const _onesErrorsExport = async (payload) => {
  return await axios.post(`/v1/economist/upload/ones-errors-export`, payload.data, {
    responseType: 'blob'
  })
}

// Tortish tarixi (pull-log) — barcha davrlar bo'yicha paginatsiyalangan yuklamalar.
const _pullHistory = async (payload) => {
  return await axios.get(`/v1/economist/upload-report-history`, { params: payload?.params })
}

// ZIP yuklab olish tarixi (Tortish tarixi → ZIP yuklab olishlar tab).
const _reportDownloads = async (payload) => {
  return await axios.get(`/v1/economist/report-downloads`, { params: payload?.params })
}

// ─────────────────────────────────────────────────────────────────────────
// To'lov turlari bo'yicha asossiz to'lovlarni aniqlash (payment-analysis).
// ─────────────────────────────────────────────────────────────────────────
// Tahlil natijalari ro'yxati (server paginatsiyasi).
const _paymentAnalysisIndex = async (payload) => {
  return await axios.get(`/v1/economist/payment-analysis`, { params: payload?.params })
}
// Tasdiqlangan xodimlar whitelist yuklash (multipart) — kodlar 47/50/55/270.
const _paymentWhitelistUpload = async (payload) => {
  return await axios.post(`/v1/economist/payment-whitelist`, payload.data)
}
// Yuklangan whitelist (imtiyozli xodimlar) ro'yxati — server paginatsiyasi.
const _paymentWhitelistIndex = (payload) => {
  return axios.get(`/v1/economist/payment-whitelist`, { params: payload?.params })
}
// Qoidalar dvigatelini qayta ishga tushirish (JSON).
const _paymentAnalysisAnalyze = async (payload) => {
  return await axios.post(`/v1/economist/payment-analysis/analyze`, payload.data)
}
// Tahlil natijalarini Excel'ga yuklash (blob).
const _paymentAnalysisExport = async (payload) => {
  return await axios.get(`/v1/economist/payment-analysis/export`, {
    params: payload?.params,
    responseType: 'blob'
  })
}
// Imtiyozli xodimni whitelist'ga qo'lda qo'shish (org+davr+kod+xodim bo'yicha dedup).
const _paymentWhitelistAddRow = (payload) => {
  return axios.post(`/v1/economist/payment-whitelist/row`, payload.data)
}
// Whitelist qatorini o'chirish (soft-delete).
const _paymentWhitelistRemove = (payload) => {
  return axios.delete(`/v1/economist/payment-whitelist/` + payload.id)
}

export default {
  _index,
  _create,
  _createFromOnes,
  _onesOrgs,
  _reportOrgs,
  _update,
  _delete,
  _enum,
  _structure,
  _confirm,
  _cancelConfirm,
  _updateStatus,
  _deleteUpload,
  _reportStatus,
  _reportStatusExport,
  _reportsZip,
  _onesErrorsExport,
  _pullHistory,
  _reportDownloads,
  _paymentAnalysisIndex,
  _paymentWhitelistUpload,
  _paymentWhitelistIndex,
  _paymentAnalysisAnalyze,
  _paymentAnalysisExport,
  _paymentWhitelistAddRow,
  _paymentWhitelistRemove
}
