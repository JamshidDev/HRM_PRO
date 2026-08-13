// ETSP login endpointlari (HRM backend). @Public — token shart emas.
// Umumiy axios interceptor (401 → logout/redirect) aralashmasligi uchun plain fetch.
const apiUrl = import.meta.env.VITE_API_URL

export const etspService = {
  // Bir martalik nonce olish → { status, challenge }
  async _challenge() {
    const r = await fetch(`${apiUrl}/api/v1/etsp/challenge?_uc=${Date.now()}`, {
      headers: { Accept: 'application/json' }
    })
    return r.json()
  },
  // Imzolangan nonce bilan kirish → { ok, status, data:{ access_token, message } }
  async _auth(payload) {
    const r = await fetch(`${apiUrl}/api/v1/etsp/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await r.json().catch(() => ({}))
    return { ok: r.ok, status: r.status, data }
  }
}

export default etspService
