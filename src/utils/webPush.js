// Brauzer push (FCM Web Push) — token LOGIN so'rovi bilan birga ketadi, alohida API yo'q.
//
// Sahifa OCHIQ bo'lganda bildirishnomani socket ko'rsatadi (socketStore), shuning uchun
// foreground'da qayta chizilmaydi. Sahifa yopiq holat `public/firebase-messaging-sw.js` da.

import { useAppSetting } from '@/utils/AppSetting.js'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

/** Qurilma id — brauzer profiliga bog'langan, localStorage'da doimiy saqlanadi. */
export const getDeviceUuid = () => {
  let id = localStorage.getItem(useAppSetting.deviceUuidKey)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(useAppSetting.deviceUuidKey, id)
  }
  return id
}

const isConfigured = () => !!firebaseConfig.projectId && !!firebaseConfig.appId && !!vapidKey

/** Brauzer web push'ni qo'llab-quvvatlaydimi. */
const isSupportedBrowser = async () => {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return false
  const { isSupported } = await import('firebase/messaging')
  return await isSupported()
}

/** Hozirgi ruxsat holati: 'granted' | 'denied' | 'default' | 'unsupported'. */
export const pushPermission = () => {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

/**
 * FCM tokenini oladi (ruxsat so'raydi). Push imkonsiz bo'lsa `null` — bu XATO EMAS,
 * login shundayam davom etadi.
 */
const fetchToken = async () => {
  if (!isConfigured()) return null
  if (!(await isSupportedBrowser())) return null
  if (Notification.permission === 'denied') return null

  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
  if (permission !== 'granted') return null

  const [{ initializeApp, getApps }, { getMessaging, getToken }] = await Promise.all([
    import('firebase/app'),
    import('firebase/messaging')
  ])
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  return await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: registration })
}

/**
 * Login body'siga qo'shiladigan qurilma maydonlari.
 * Ruxsat OLDIN berilgan bo'lsa token ham qo'shiladi; berilmagan bo'lsa
 * login'da ruxsat SO'RALMAYDI — u home sahifada so'raladi (`syncPushOnHome`).
 */
export const getLoginDeviceData = async () => {
  const data = {
    device_uuid: getDeviceUuid(),
    platform: 'web',
    app_version: import.meta.env.VITE_APP_VERSION || undefined
  }
  try {
    if (pushPermission() === 'granted') {
      const token = await fetchToken()
      if (token) data.fcm_token = token
    }
  } catch (e) {
    console.warn('[push] login token olinmadi:', e?.message || e)
  }
  return data
}

/** Tokenni backendga yozadi (o'zgarmagan bo'lsa so'rov yubormaydi). */
const saveToken = async (token) => {
  if (!token) return false
  if (localStorage.getItem(useAppSetting.pushTokenKey) === token) return true
  const ApiService = (await import('@/service/ApiService.js')).default
  await ApiService.pushService._updateFcm({
    data: {
      fcm_token: token,
      notification: true,
      platform: 'web',
      app_version: import.meta.env.VITE_APP_VERSION || undefined
    }
  })
  localStorage.setItem(useAppSetting.pushTokenKey, token)
  return true
}

/**
 * Banner tugmasi uchun: ruxsat so'raydi va tokenni yozadi.
 * Qaytadi: 'granted' | 'denied' | 'unsupported'.
 */
export const requestPushPermission = async () => {
  if (!isConfigured()) return 'unsupported'
  if (!(await isSupportedBrowser())) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'

  localStorage.setItem(useAppSetting.pushAskedKey, '1')
  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'

  await saveToken(await fetchToken())
  return 'granted'
}

/**
 * Home sahifada chaqiriladi: ruxsatni BIR MARTA so'raydi, token olsa backendga yozadi.
 * Token o'zgarmagan bo'lsa so'rov yubormaydi; rad etilgan bo'lsa qayta bezovta qilmaydi.
 */
export const syncPushOnHome = async () => {
  try {
    if (!isConfigured()) return
    if (!(await isSupportedBrowser())) return

    const permission = pushPermission()
    if (permission === 'denied' || permission === 'unsupported') return
    if (permission === 'default') {
      if (localStorage.getItem(useAppSetting.pushAskedKey)) return
      localStorage.setItem(useAppSetting.pushAskedKey, '1')
      if ((await Notification.requestPermission()) !== 'granted') return
    }

    await saveToken(await fetchToken())
  } catch (e) {
    console.warn('[push] sinxronlash xatosi:', e?.message || e)
  }
}
