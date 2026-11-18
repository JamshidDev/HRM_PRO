import { defineStore } from 'pinia'
import io from 'socket.io-client'
import CryptoJS from 'crypto-js'
import QRCode from 'qrcode'
import { useLoginNewStore } from '@/store/modules/index.js'

const socketUrl = import.meta.env.VITE_SOCKET_URL
const socketSecret = import.meta.env.VITE_SOCKET_SECRET

// QR login — backend bilan kontrakt (batafsil: nestjs-app/super-power/modules/auth.md):
//   ULANISH = SESSIYA. `/qr-login` namespace'ga ulanish yangi sid + kalit yaratadi,
//   uzilish esa uni bekor qiladi. Shu sabab "yangilash" = qayta ulanish.
//
//   server → front  `qr:code`     { sid, key, prefix, server_time, interval_ms, expires_in }
//   server → front  `qr:claimed`  — telefon jonli tekshiruvdan o'tdi, tasdiq kutilmoqda
//   server → front  `qr:released` — telefonda bekor qilindi, QR yana ishlaydi
//   server → front  `qr:approved` { access_token, offer }  — ACK talab qiladi
//
// JONLI QR: brauzer har `interval_ms` da kalit bilan yangi kadr yasaydi —
// "HRM2." + base64url(sid ‖ t ‖ HMAC-SHA256(key, sid‖t)[0..10]). Skrinshot ishlamaydi.

const hexToBytes = (hex) => Uint8Array.from(hex.match(/../g).map((h) => parseInt(h, 16)))

const wordsToBytes = (wa) => {
  const out = new Uint8Array(wa.sigBytes)
  for (let i = 0; i < wa.sigBytes; i++) out[i] = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
  return out
}

const base64url = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

// Backend `buildQrFrame` bilan bir xil algoritm (crypto-js — http'da ham ishlaydi).
export function buildQrFrame(prefix, sid, keyHex, t) {
  const msg = new Uint8Array(20)
  msg.set(hexToBytes(sid), 0)
  new DataView(msg.buffer).setUint32(16, t)
  const mac = CryptoJS.HmacSHA256(
    CryptoJS.lib.WordArray.create(msg),
    CryptoJS.enc.Hex.parse(keyHex)
  )
  const body = new Uint8Array(30)
  body.set(msg, 0)
  body.set(wordsToBytes(mac).subarray(0, 10), 20)
  return prefix + base64url(body)
}

export const useQrLoginStore = defineStore('qrLoginStore', {
  state: () => ({
    socket: null,
    // idle | connecting | ready | claimed | expired | approved | error
    status: 'idle',
    // Joriy kadr (`HRM2.…`) va uning rasmi — har `interval` da yangilanadi
    payload: null,
    image: null,
    session: null,
    // Server soati bilan farq (ms) — kadr vaqti server bo'yicha bo'lsin
    offset: 0,
    interval: 2000,
    frameTimer: null,
    remaining: 0,
    timer: null,
    errorKey: null
  }),
  actions: {
    // "QR-kod" tabi ochilganda chaqiriladi
    open() {
      if (this.socket) return
      this.status = 'connecting'
      this.errorKey = null
      this.image = null

      this.socket = io(`${socketUrl}/qr-login`, {
        auth: { secret: socketSecret },
        transports: ['websocket'],
        // Yangilash qayta ulanish orqali bo'ladi — avtomatik reconnect kalitni
        // bexosdan almashtirib yubormasligi uchun o'chirilgan.
        reconnection: false
      })

      this.socket.on('qr:code', (data) => {
        if (!data?.sid || !data?.key) return
        this.session = { sid: data.sid, key: data.key, prefix: data.prefix || 'HRM2.' }
        this.offset = Number(data.server_time) ? Number(data.server_time) - Date.now() : 0
        this.interval = Number(data.interval_ms) || 2000
        this.status = 'ready'
        this._startFrames()
        this._startCountdown(data?.expires_in ?? 0)
      })

      // Telefon tasdiqlayapti — kadrlar to'xtaydi, hisoblagich band muddatiga o'tadi.
      this.socket.on('qr:claimed', (data) => {
        if (this.status !== 'ready') return
        this.status = 'claimed'
        this._stopFrames()
        this._startCountdown(data?.expires_in ?? 0)
      })

      this.socket.on('qr:released', (data) => {
        if (this.status !== 'claimed') return
        const left = Number(data?.expires_in) || 0
        if (left <= 0) {
          this.status = 'expired'
          return
        }
        this.status = 'ready'
        this._startFrames()
        this._startCountdown(left)
      })

      this.socket.on('qr:approved', (data, ack) => {
        // ACK BIRINCHI: server 2 soniya kutadi, tasdiq kelmasa tokenni bekor qiladi.
        if (typeof ack === 'function') ack()
        this.status = 'approved'
        this._stopCountdown()
        this.close()
        useLoginNewStore()._handleAuthSuccess({ data }, 'qr')
      })

      this.socket.on('connect_error', () => {
        this.status = 'error'
        this.errorKey = 'connection'
        this._stopCountdown()
        this.close()
      })

      this.socket.on('disconnect', () => {
        if (this.status === 'approved') return
        this.status = 'idle'
        this._stopFrames()
        this._stopCountdown()
      })
    },

    // Tab almashdi / sahifadan chiqildi — sessiya serverda ham bekor bo'ladi
    close() {
      if (this.socket) {
        this.socket.removeAllListeners()
        this.socket.disconnect()
        this.socket = null
      }
      this._stopFrames()
      this._stopCountdown()
      if (this.status !== 'approved') {
        this.status = 'idle'
        // Eskirgan QR ekranda qolib ketmasin (tabga qaytilganda ko'rinib qolardi).
        this.payload = null
        this.image = null
        this.session = null
      }
    },

    // Muddati tugadi / xato — yangi kalit uchun qayta ulanamiz.
    refresh() {
      this.close()
      this.open()
    },

    // Kadr sikli: darhol bitta, keyin har `interval` da yangisi.
    _startFrames() {
      this._stopFrames()
      this._renderFrame()
      this.frameTimer = setInterval(() => this._renderFrame(), this.interval)
    },

    _stopFrames() {
      if (this.frameTimer) {
        clearInterval(this.frameTimer)
        this.frameTimer = null
      }
    },

    async _renderFrame() {
      const s = this.session
      if (!s) return
      const t = Math.floor((Date.now() + this.offset) / 1000)
      const payload = buildQrFrame(s.prefix, s.sid, s.key, t)
      const image = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256
      })
      // Kutish paytida sessiya almashgan bo'lsa — eski kadrni qo'ymaymiz.
      if (this.session !== s) return
      this.payload = payload
      this.image = image
    },

    _startCountdown(seconds) {
      this._stopCountdown()
      this.remaining = seconds
      if (!seconds) return
      this.timer = setInterval(() => {
        this.remaining -= 1
        if (this.remaining <= 0) {
          this._stopCountdown()
          this._stopFrames()
          // Sessiya tugadi — foydalanuvchi "Yangilash" bosmaguncha yangisi so'ralmaydi.
          this.status = 'expired'
        }
      }, 1000)
    },

    _stopCountdown() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  }
})
