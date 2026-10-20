import { reactive } from 'vue'
import { AppPaths, useAppSetting } from '@/utils/index.js'

// «Seans tugadi» holati: token darhol o'chadi, so'rovlar to'xtaydi, alert 5 soniyadan keyin login'ga olib o'tadi.
export const SESSION_ENDED_SECONDS = 5

export const sessionEndedState = reactive({ active: false, info: null, seconds: 0 })

let controller = new AbortController()

// Barcha axios so'rovlari shu signal bilan ketadi — seans tugaganda yo'ldagilari ham bekor bo'ladi.
export const sessionSignal = () => controller.signal

export const isSessionEnded = () => sessionEndedState.active

export function endSession(info = {}) {
  if (sessionEndedState.active) return
  sessionEndedState.active = true
  sessionEndedState.info = info
  sessionEndedState.seconds = SESSION_ENDED_SECONDS
  localStorage.removeItem(useAppSetting.tokenKey)
  controller.abort()
  import('@/store/modules/index.js').then((m) => m.useSocketStore?.().disconnect?.())

  const timer = setInterval(async () => {
    sessionEndedState.seconds -= 1
    if (sessionEndedState.seconds > 0) return
    clearInterval(timer)
    const { default: router } = await import('@/router/index')
    await router.push(AppPaths.Login)
    controller = new AbortController()
    sessionEndedState.active = false
    sessionEndedState.info = null
  }, 1000)
}

// Shu brauzerda qayta kirilganda token almashadi — biroz kutib, token hali o'shami tekshiriladi.
const RELOGIN_GRACE_MS = 2000
export const currentTokenId = () => (localStorage.getItem(useAppSetting.tokenKey) || '').split('|')[0]

// Faqat boshqa qurilma/tizim yopgan bo'lsa alert; o'zi qayta kirgan bo'lsa (relogin, token almashgan) — jim.
export function endSessionIfForeign(info = {}, tokenId) {
  if (['logout', 'relogin'].includes(info.reason)) return
  if (!tokenId || String(tokenId) !== currentTokenId()) return
  setTimeout(() => {
    if (String(tokenId) === currentTokenId()) endSession(info)
  }, RELOGIN_GRACE_MS)
}

// Sabab → i18n kaliti (`sessionEnded.reasons.*`).
export function sessionEndedReasonKey(info) {
  if (!info) return 'default'
  if (info.reason === 'revoked') return info.by?.kind === 'web' ? 'revoked_web' : 'revoked_mobile'
  if (info.reason === 'expired')
    return info.expired === 'absolute' ? 'expired_absolute' : 'expired_idle'
  const known = [
    'replaced',
    'password_changed',
    'password_reset',
    'blocked',
    'deleted',
    'no_position'
  ]
  return known.includes(info.reason) ? info.reason : 'default'
}
