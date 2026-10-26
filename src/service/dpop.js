// DPoP: har API so'rovi brauzerdan chiqarib bo'lmaydigan kalit bilan imzolanadi — nusxalangan token boshqa joyda ishlamaydi.

const DB_NAME = 'hrm-dpop'
const STORE = 'keys'
const KEY_ID = 'current'

let keyPromise = null
let jwkPromise = null
let clockOffsetSec = 0

const supported = () =>
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  !!window.crypto?.subtle &&
  !!window.indexedDB

const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const b64urlText = (text) => b64url(new TextEncoder().encode(text))

const withStore = (mode, fn) =>
  new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1)
    open.onupgradeneeded = () => open.result.createObjectStore(STORE)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const tx = open.result.transaction(STORE, mode)
      const req = fn(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(req?.result)
      tx.onerror = () => reject(tx.error)
    }
  })

// Maxfiy kalit `extractable: false` — JS ham, DevTools ham uni o'qiy olmaydi; IndexedDB faqat ob'ektni saqlaydi.
const generateAndSave = async () => {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, [
    'sign',
    'verify'
  ])
  await withStore('readwrite', (s) => s.put(pair, KEY_ID))
  return pair
}

const getKey = () => {
  if (!keyPromise) {
    keyPromise = withStore('readonly', (s) => s.get(KEY_ID))
      .then((pair) => pair || generateAndSave())
      .catch(() => null)
  }
  return keyPromise
}

const getJwk = async (pair) => {
  if (!jwkPromise) {
    jwkPromise = crypto.subtle
      .exportKey('jwk', pair.publicKey)
      .then(({ kty, crv, x, y }) => ({ kty, crv, x, y }))
  }
  return jwkPromise
}

const randomId = () => b64url(crypto.getRandomValues(new Uint8Array(18)))

// Server `Date` sarlavhasidan soat farqi — kompyuter soati noto'g'ri bo'lsa ham iat to'g'ri ketsin.
export const syncServerClock = (dateHeader) => {
  const ms = Date.parse(dateHeader || '')
  if (Number.isFinite(ms)) clockOffsetSec = Math.round((ms - Date.now()) / 1000)
}

/** `DPoP` sarlavhasi qiymati yoki null (eski brauzer / http — server log rejimida o'tkazadi). */
export const dpopProof = async (method, url, token) => {
  if (!token || !supported()) return null
  const pair = await getKey()
  if (!pair) return null
  const target = new URL(url, window.location.origin)
  const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: await getJwk(pair) }
  const ath = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))
  const payload = {
    htm: String(method || 'GET').toUpperCase(),
    htu: target.pathname + target.search,
    iat: Math.floor(Date.now() / 1000) + clockOffsetSec,
    jti: randomId(),
    ath
  }
  const input = `${b64urlText(JSON.stringify(header))}.${b64urlText(JSON.stringify(payload))}`
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    pair.privateKey,
    new TextEncoder().encode(input)
  )
  return `${input}.${b64url(sig)}`
}
