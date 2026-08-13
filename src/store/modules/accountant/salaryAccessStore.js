import { defineStore } from 'pinia'
import instance from '@/service/index.js'
import salary1cService from '@/service/v1/accountant/salary1cService.js'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

// Oylik (salary) step-up — Telegram OTP (2FA). Oylik endpointlari 403 { code:
// 'salary_step_up_required' } qaytarsa, axios interceptor shu store'ni ochadi:
// bloklangan so'rovlar navbatga qo'yiladi, Telegram'ga kod yuboriladi, kod
// tasdiqlangach navbat qayta yuboriladi. Alohida "oylik paroli" YO'Q — faqat kod.
export const useSalaryAccessStore = defineStore('salaryAccessStore', {
  state: () => ({
    visible: false,
    loading: false,
    statusLoading: false,
    // Telegram bot ulanganmi (kod yuborish mumkinmi).
    telegramLinked: false,
    // 422 salary_telegram_not_linked — botga ulanmagan (fail-closed).
    telegramMissing: false,
    // "Telegramda ochish" havolasi (status.bot_url) — ulanmaganda ko'rsatiladi.
    botUrl: null,
    unlocked: false,
    unlockedUntil: null,
    ttlSeconds: 0,
    // Kod yuborilganmi + qolgan muddat / qayta yuborishgacha (soniya).
    otpSent: false,
    otpExpiresIn: 0,
    resendIn: 0,
    // Serverdan: kutilayotgan (tasdiqlanmagan) kod bor-yo'qligi + tugash vaqti.
    _otpPending: false,
    _otpExpiresAt: null,
    // 403 sababli kutib turgan so'rovlar: { config, resolve, reject }
    _queue: [],
    _timer: null,
    _otpTimer: null,
    _resendTimer: null
  }),
  actions: {
    // Interceptor: bloklangan so'rovni navbatga qo'yadi va modalni ochadi.
    enqueue(item) {
      this._queue.push(item)
    },
    open() {
      // Idempotent: interceptor HAR 403 uchun open() chaqiradi (sahifada ko'p so'rov + polling).
      // Allaqachon ochiq bo'lsa qayta init/kod so'ramaymiz — aks holda takror requestCode →
      // "Yangi kod Ns dan so'ng" cooldown xatolari va countdown buzilishi kelib chiqadi.
      if (this.visible) return
      this.visible = true
      this._init()
    },
    close() {
      this.visible = false
      this._clearOtpTimers()
      // Foydalanuvchi bekor qildi — kutayotgan so'rovlarni rad etamiz (osilib qolmasin).
      this._rejectQueue(new Error(t('salaryAccess.cancelled')))
    },

    // Modal ochilganda: holatni olamiz. Telegram ulangan va ochilmagan bo'lsa —
    // kutilayotgan kod bo'lmasa yangi kod so'raymiz.
    async _init() {
      this.telegramMissing = false
      this.otpSent = false
      await this._status()
      if (this.unlocked) {
        this.visible = false
        this._flushQueue()
        return
      }
      if (!this.telegramLinked) {
        this.telegramMissing = true
        return
      }
      // Kutilayotgan (hali amaldagi) kod bo'lsa — qayta so'ramaymiz (cooldown 429 oldini olamiz),
      // o'shani ishlatamiz va qolgan muddatдан countdown boshlaymiz.
      const remaining = this._pendingRemainingSeconds()
      if (this._otpPending && remaining > 0) {
        this.otpSent = true
        this.otpExpiresIn = remaining
        this.resendIn = 0
        this._startOtpCountdown()
        return
      }
      await this.requestCode()
    },

    // status.otp_expires_at (Asia/Tashkent devor-vaqti) → qolgan soniya.
    _pendingRemainingSeconds() {
      if (!this._otpExpiresAt) return 0
      const exp = new Date(String(this._otpExpiresAt).replace(' ', 'T')).getTime()
      if (!Number.isFinite(exp)) return 0
      return Math.max(0, Math.floor((exp - Date.now()) / 1000))
    },

    _status() {
      this.statusLoading = true
      return salary1cService
        ._salaryAccessStatus()
        .then((res) => {
          const d = res.data.data
          this.telegramLinked = !!d.telegram_linked
          this.unlocked = !!d.unlocked
          this.unlockedUntil = d.unlocked_until ?? null
          this.ttlSeconds = Number(d.ttl_seconds || 0)
          this.botUrl = d.bot_url ?? null
          this._otpPending = !!d.otp_pending
          this._otpExpiresAt = d.otp_expires_at ?? null
          if (this.unlocked) this._scheduleAutoLock(this.ttlSeconds)
        })
        .finally(() => {
          this.statusLoading = false
        })
    },

    // Telegram'ga kod yuborish (yoki qayta yuborish).
    async requestCode() {
      this.loading = true
      this.telegramMissing = false
      try {
        const res = await salary1cService._salaryAccessRequestCode()
        const d = res.data.data
        this.otpSent = true
        this.otpExpiresIn = Number(d.expires_in || 0)
        this.resendIn = Number(d.resend_in || 0)
        this._startOtpCountdown()
        this._startResendCountdown()
      } catch (e) {
        const code = e?.response?.data?.data?.code
        // Telegram ulanmagan YOKI botni Start bosmagan — ikkalasida ham "botni oching" holati.
        if (
          e?.response?.status === 422 &&
          (code === 'salary_telegram_not_linked' || code === 'salary_bot_not_started')
        ) {
          this.telegramMissing = true
          this.otpSent = false
        }
        // 429 (resend cooldown) va boshqa xatolarni interceptor toast qiladi.
      } finally {
        this.loading = false
      }
    },

    // Kodni tasdiqlash — muvaffaqiyatda sessiya ochiladi, navbat qayta yuboriladi.
    async verify(code) {
      this.loading = true
      try {
        const res = await salary1cService._salaryAccessVerifyCode({ data: { code } })
        const d = res.data.data
        this.unlocked = true
        this.unlockedUntil = d.unlocked_until ?? null
        this.ttlSeconds = Number(d.ttl_seconds || 0)
        this._scheduleAutoLock(this.ttlSeconds)
        this.otpSent = false
        this.visible = false
        this._clearOtpTimers()
        this._flushQueue()
      } catch {
        // Noto'g'ri/muddati o'tgan kod (422) yoki urinishlar ko'p (429) — interceptor
        // toast ko'rsatadi, modal ochiq qoladi. Bu yerda yutamiz (unhandled rejection bo'lmasin).
      } finally {
        this.loading = false
      }
    },

    _lock() {
      this._clearTimer()
      this.unlocked = false
      this.unlockedUntil = null
      this.ttlSeconds = 0
      return salary1cService._salaryAccessLock().catch(() => {})
    },

    // Muddat tugaganda mahalliy holatni yopamiz — keyingi so'rov 403 berib modalni qayta ochadi.
    _scheduleAutoLock(seconds) {
      this._clearTimer()
      if (!seconds || seconds <= 0) return
      this._timer = setTimeout(() => {
        this.unlocked = false
        this.unlockedUntil = null
        this.ttlSeconds = 0
      }, seconds * 1000)
    },
    _clearTimer() {
      if (this._timer) {
        clearTimeout(this._timer)
        this._timer = null
      }
    },

    // Kod muddati sanog'i (har soniya kamayadi; 0 da tugaydi).
    _startOtpCountdown() {
      if (this._otpTimer) clearInterval(this._otpTimer)
      if (!this.otpExpiresIn || this.otpExpiresIn <= 0) return
      this._otpTimer = setInterval(() => {
        this.otpExpiresIn = Math.max(0, this.otpExpiresIn - 1)
        if (this.otpExpiresIn <= 0) {
          clearInterval(this._otpTimer)
          this._otpTimer = null
        }
      }, 1000)
    },
    // Qayta yuborishgacha sanog'i.
    _startResendCountdown() {
      if (this._resendTimer) clearInterval(this._resendTimer)
      if (!this.resendIn || this.resendIn <= 0) return
      this._resendTimer = setInterval(() => {
        this.resendIn = Math.max(0, this.resendIn - 1)
        if (this.resendIn <= 0) {
          clearInterval(this._resendTimer)
          this._resendTimer = null
        }
      }, 1000)
    },
    _clearOtpTimers() {
      if (this._otpTimer) {
        clearInterval(this._otpTimer)
        this._otpTimer = null
      }
      if (this._resendTimer) {
        clearInterval(this._resendTimer)
        this._resendTimer = null
      }
    },

    // Navbatdagi so'rovlarni qayta yuboradi (ochilgach).
    _flushQueue() {
      const queue = this._queue
      this._queue = []
      queue.forEach(({ config, resolve, reject }) => {
        instance
          .request(config)
          .then((r) => resolve(r))
          .catch((e) => reject(e))
      })
    },
    _rejectQueue(err) {
      const queue = this._queue
      this._queue = []
      queue.forEach(({ reject }) => reject(err))
    }
  }
})
