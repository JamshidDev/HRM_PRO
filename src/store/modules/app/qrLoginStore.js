import { defineStore } from 'pinia'
import io from 'socket.io-client'
import { useLoginNewStore } from '@/store/modules/index.js'

const socketUrl = import.meta.env.VITE_SOCKET_URL
const socketSecret = import.meta.env.VITE_SOCKET_SECRET

// QR login — backend bilan kontrakt (batafsil: nestjs-app/super-power/modules/auth.md):
//   ULANISH = SESSIYA. `/qr-login` namespace'ga ulanish yangi kalit (sid) yaratadi,
//   uzilish esa uni bekor qiladi. Shu sabab "yangilash" = qayta ulanish.
//
//   server → front  `qr:code`     { payload, qr_image, expires_in }
//   server → front  `qr:approved` { access_token, offer }  — ACK talab qiladi
//   front  → server hech qanday event yo'q (faqat connect/disconnect + ACK)
//
// Token BRAUZERGA keladi (mobil ilova uni saqlamaydi) va mavjud login oqimiga
// uzatiladi — `loginNewStore._handleAuthSuccess` offerta modali, profil yuklash
// va Home'ga redirect'ni o'zi bajaradi.
export const useQrLoginStore = defineStore('qrLoginStore', {
  state: () => ({
    socket: null,
    // idle | connecting | ready | expired | approved | error
    status: 'idle',
    // QR ichidagi xom satr (`HRM1.…`) — rasm bilan birga keladi
    payload: null,
    image: null,
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
        this.payload = data?.payload ?? null
        this.image = data?.qr_image ?? null
        this.status = 'ready'
        this._startCountdown(data?.expires_in ?? 0)
      })

      this.socket.on('qr:approved', (data, ack) => {
        // ACK BIRINCHI: server 2 soniya kutadi, tasdiq kelmasa tokenni bekor qiladi.
        if (typeof ack === 'function') ack()
        this.status = 'approved'
        this._stopCountdown()
        this.close()
        useLoginNewStore()._handleAuthSuccess({ data })
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
      this._stopCountdown()
      if (this.status !== 'approved') {
        this.status = 'idle'
        // Eskirgan QR ekranda qolib ketmasin (tabga qaytilganda ko'rinib qolardi).
        this.payload = null
        this.image = null
      }
    },

    // Muddati tugadi / xato — yangi kalit uchun qayta ulanamiz.
    // `open()` `status='connecting'` qo'yadi → QR qutisi ichida loader chiqadi.
    refresh() {
      this.close()
      this.open()
    },

    _startCountdown(seconds) {
      this._stopCountdown()
      this.remaining = seconds
      if (!seconds) return
      this.timer = setInterval(() => {
        this.remaining -= 1
        if (this.remaining <= 0) {
          this._stopCountdown()
          // Kod eskirdi — foydalanuvchi "Yangilash" bosmaguncha yangisi so'ralmaydi.
          // (Mobil eskirgan kodni skanerlasa, server o'zi yangi `qr:code` yuboradi.)
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
