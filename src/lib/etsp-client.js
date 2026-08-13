// ETSP Client SDK (ESM) — korxona ichki E-IMZO agenti bilan ishlaydi.
// Agent foydalanuvchi kompyuterida: https://127.0.0.1:27443 (ishonchli localhost cert).
// E-IMZO CAPIWS ekvivalenti; bu yerda faqat login uchun kerak metodlar.
export const ETSP_AGENT_URL =
  import.meta.env.VITE_ETSP_AGENT_URL || 'https://127.0.0.1:27443'

async function agent(path, body) {
  const res = await fetch(ETSP_AGENT_URL + path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'ETSP agent xatosi: ' + res.status)
  return data
}

export const ETSP = {
  // Agent o'rnatilgan va ishlayaptimi?
  async ping() {
    try {
      const d = await agent('/ping')
      return !!(d && (d.ok || d.status === 'ok'))
    } catch {
      return false
    }
  },
  // Kalitlar ro'yxati (C:\DSKEYS, parolsiz metadata: file/fio/pinfl/expired).
  listKeys() {
    return agent('/keys')
  },
  // nonce'ni kalit bilan imzolash (AUTH). → { signature, certPem }
  signAuth(keyId, password, nonce) {
    return agent('/sign-auth', { keyId, password, nonce })
  }
}

export default ETSP
