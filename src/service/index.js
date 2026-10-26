import axios from 'axios'
import { AppPaths, useAppSetting, isPasswordExpiredError } from '@/utils/index.js'
import router from '../router/index'
import Utils from '@/utils/Utils.js'
import i18n from '@/i18n/index.js'
import { reportApiError } from '@/utils/errorReporter.js'
import { getDeviceUuid } from '@/utils/webPush.js'
import { showAlert, alertFromAxiosError, isToastOnlyPage } from '@/components/notify/alertDialog.js'
import { endSessionIfForeign, isSessionEnded, sessionSignal } from '@/features/sessionEnded/sessionEnded.js'
import { dpopProof, syncServerClock } from '@/service/dpop.js'
const apiUrl = import.meta.env.VITE_API_URL
console.log(apiUrl)
const { t } = i18n.global
const instance = axios.create({
  baseURL: `${apiUrl}/api`
})

let isLoggingOut = false

// So'rov yuborilgandan keyin localStorage'dagi token almashganmi (qayta login).
const isStaleTokenRequest = (config) => {
  const sent = String(config?.headers?.Authorization || '').replace(/^Bearer /, '')
  if (!sent || config?.url === '/auth/login') return false
  return sent !== (localStorage.getItem(useAppSetting.tokenKey) || '')
}

instance.interceptors.request.use(async function (config) {
  // Seans tugagan — alert turgan paytda hech qanday so'rov ketmaydi.
  if (isSessionEnded()) return Promise.reject(new axios.CanceledError('session_ended'))
  // Chaqiruvchining o'z signali bo'lsa ikkalasi birlashtiriladi (eski brauzerda — o'zinikini saqlaymiz).
  if (!config.signal) config.signal = sessionSignal()
  else if (typeof AbortSignal.any === 'function')
    config.signal = AbortSignal.any([config.signal, sessionSignal()])
  // Token hali saqlanmagan bo'lsa (masalan, offerta) — chaqiruvchi bergan Authorization tokeni imzolanadi.
  const explicit = String(config.headers['Authorization'] || '').replace(/^Bearer\s+/i, '') || null
  let token = localStorage.getItem(useAppSetting.tokenKey) || explicit
  config.headers['Accept-Language'] =
    localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
  config.headers['Access-Control-Allow-Origin'] = '*'

  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }

  if (config.url !== '/auth/login') {
    config.headers['X-Auth-Type'] = 'sanctum'
  }

  // Qurilma id — logout shu header orqali push tokenini o'chiradi.
  config.headers['X-Device-UUID'] = getDeviceUuid()

  // Token shu brauzer kalitiga bog'lanadi — URL (query bilan) va vaqt imzolanadi.
  if (token) {
    const proof = await dpopProof(config.method, instance.getUri(config), token).catch(() => null)
    if (proof) config.headers['DPoP'] = proof
  }

  return config
})

instance.interceptors.response.use(
  (response) => {
    syncServerClock(response.headers?.date)
    if (
      [Utils.methodTypes.PUT, Utils.methodTypes.POST, Utils.methodTypes.DELETE].includes(
        response.config.method
      )
    ) {
      // `silentSuccess`: chaqiruvchi o'z (aniqroq) xabarini ko'rsatadi — takror toast chiqmasin.
      if (
        !response.config?.silentSuccess &&
        !response.data?.error &&
        response?.data?.message &&
        typeof response.data?.message === 'string'
      ) {
        $Toast.success(response.data.message.toString())
      }
    }
    isLoggingOut = false
    return Promise.resolve(response)
  },
  async (error) => {
    // DPoP vaqtinchalik rad etishi (soat farqi yoki tarmoq qayta yuborgan nusxa) — seans tugamaydi, yangi imzo bilan bir marta qayta.
    // Kodlar: 4171 — soat farqi, 4108 — takroriy nusxa (super-power/api-security-dpop.md); eski `reason` ham tushuniladi.
    const data = error.response?.status === 401 ? error.response?.data || {} : {}
    const clockSkew = data.code === 4171 || data.reason === 'iat'
    const replay = data.code === 4108 || data.reason === 'replay'
    if (clockSkew || replay) {
      syncServerClock(error.response.headers?.date)
      const method = String(error.config?.method || 'get').toLowerCase()
      // Replay'da birinchi nusxa bajarilgan — faqat GET/HEAD qayta yuboriladi (POST ikki marta bajarilmasin).
      if (!error.config.__dpopRetried && (clockSkew || method === 'get' || method === 'head')) {
        error.config.__dpopRetried = true
        return instance(error.config)
      }
      error.__notified = true
      return Promise.reject(error)
    }
    // Eski token bilan ketgan so'rov (shu brauzerda qayta kirildi) — yangi token bilan bir marta qayta yuboriladi.
    if (error.response?.status === 401 && isStaleTokenRequest(error.config)) {
      if (!error.config.__staleRetried && localStorage.getItem(useAppSetting.tokenKey)) {
        error.config.__staleRetried = true
        return instance(error.config)
      }
      error.__notified = true
      return Promise.reject(error)
    }
    // Seans tugadi (socket yoki 401 session_ended) — toast/redirect yo'q, alert o'zi login'ga olib o'tadi.
    if (error.response?.status === 401 && error.response?.data?.code === 'session_ended') {
      const sent = String(error.config?.headers?.Authorization || '').replace(/^Bearer /, '')
      endSessionIfForeign(error.response.data, sent.split('|')[0])
      error.__notified = true
      return Promise.reject(error)
    }
    if (isSessionEnded()) {
      error.__notified = true
      return Promise.reject(error)
    }
    if (error.name === 'CanceledError') {
      error.message = t('content.waitResponse')
    }

    // Parol muddati o'tgani — login sahifasi buni ALOHIDA ekranda ko'rsatadi
    // (Telegram bot orqali tiklash yo'riqnomasi bilan). Toast ham chiqsa,
    // bir xil xabar ikki joyda takrorlanardi.
    if (isPasswordExpiredError(error)) {
      reportApiError(error)
      return Promise.reject(error)
    }

    // eimzoGate: iqtisod API'si E-IMZO tasdig'ini talab qildi — sahifa o'rniga tasdiqlash kartasi chiqadi.
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === 'eimzo_verification_required'
    ) {
      import('@/features/eimzoGate/eimzoGateStore.js').then((m) => m.useEimzoGateStore()._lock())
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      const serviceUrl = error.response?.config?.url?.toString()
      if (serviceUrl.includes('auth/login')) {
        $Toast.error(error.response?.data?.message ?? error.message)
        return Promise.reject(error)
      }

      if (isLoggingOut) {
        return Promise.reject(error)
      }

      if (!error.response.request.responseURL.includes(AppPaths.Profile)) {
        // Raqamli kod xabarga qo'shiladi — foydalanuvchi yuborsa sababni kod bo'yicha topamiz.
        const code = typeof error.response.data?.code === 'number' ? ` (${error.response.data.code})` : ''
        $Toast.error(`${error.response.data.message}${code}`)
      }
      isLoggingOut = true
      localStorage.removeItem(useAppSetting.tokenKey)
      await router.push(AppPaths.Login)
    } else if (
      !error.config?.silentError &&
      error.config?.errorUi !== 'toast' &&
      !isToastOnlyPage() &&
      alertFromAxiosError(error)
    ) {
      // Foydalanuvchi amali xatosi (403, 422, 4xx, aloqa) — 3D ikonkali modal; login sahifasida toast.
      showAlert(alertFromAxiosError(error))
      error.__notified = true
    } else if (error.response?.data?.message) {
      if (!error.config?.silentError) {
        $Toast.error(error.response?.data?.message)
        error.__notified = true
      }
    } else if (error?.message) {
      // `silentError` bu yerda ham hisobga olinadi: backend `message` bermagan
      // 403 larda oldin xom "Request failed with status code 403" chiqib ketardi.
      if (!error.config?.silentError) {
        $Toast.warning(error.message)
        error.__notified = true
      }
    }

    // Telegram log guruhi: 5xx, network/timeout va kutilmagan 4xx lar.
    // O'zi filtrlaydi va hech qachon throw qilmaydi.
    reportApiError(error)

    return Promise.reject(error)
  }
)

export default instance
