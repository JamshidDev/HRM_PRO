/* HRM PRO — FCM web push service worker.
   Sahifa yopiq/fonda bo'lganda bildirishnoma shu yerda chiziladi.
   Sahifa ochiq bo'lsa socket toast ko'rsatadi — dublikat bo'lmasligi uchun chetlab o'tamiz. */

importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js')

// Yangi versiya darhol faollashsin (aks holda barcha tablar yopilguncha kutadi).
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

firebase.initializeApp({
  apiKey: 'AIzaSyD_mcEVAq-Y66Z7m1dS9ssv6OVO1ZTTVEg',
  authDomain: 'das-uty-e3958.firebaseapp.com',
  projectId: 'das-uty-e3958',
  storageBucket: 'das-uty-e3958.firebasestorage.app',
  messagingSenderId: '593212943989',
  appId: '1:593212943989:web:d1339ce4179408b4a7923c'
})

const DEFAULT_LANG = 'uz'

// data.title / data.content — {uz,ru,en} JSON-string; backend `toFcmData` shunday yuboradi.
const pickLang = (raw, fallback) => {
  try {
    const map = JSON.parse(raw || '{}')
    return map[DEFAULT_LANG] || map.uz || map.ru || map.en || fallback || ''
  } catch {
    return fallback || ''
  }
}

firebase.messaging().onBackgroundMessage(async ({ notification, data }) => {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  // Ko'rinadigan tab bor — socket allaqachon ko'rsatdi.
  if (clientList.some((c) => c.visibilityState === 'visible')) return

  await self.registration.showNotification(pickLang(data?.title, notification?.title), {
    body: pickLang(data?.content, notification?.body),
    image: data?.image_url || undefined,
    // macOS native bildirishnomada `image` ko'rinmaydi — rasm `icon` sifatida
    // banner o'ng tomonida kichik kvadrat bo'lib chiqadi.
    icon: data?.image_url || '/favicon.ico',
    // Har xabar alohida teg — aks holda macOS eskisini JIMGINA almashtiradi
    // va ovoz chiqmaydi (native markaz `renotify` ni e'tiborsiz qoldiradi).
    tag: data?.id ? `hrm-${data.id}` : `hrm-${Date.now()}`,
    renotify: true,
    silent: false,
    // Yopmaguncha ekranda tursin (macOS'da Chrome alert style'iga bog'liq).
    requireInteraction: true,
    data: { id: data?.id || '' }
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const client = clientList.find((c) => 'focus' in c)
      if (client) return client.focus()
      return self.clients.openWindow('/')
    })
  )
})
