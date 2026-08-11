import { defineStore } from 'pinia'
import instance from '@/service/index.js'
import salary1cService from '@/service/v1/accountant/salary1cService.js'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

// Oylik (salary) step-up — "oylik paroli". Oylik endpointlari 403 { code:
// 'salary_step_up_required' } qaytarsa, axios interceptor shu store'ni ochadi:
// bloklangan so'rovlar navbatga qo'yiladi, parol bilan ochilgach qayta yuboriladi.
export const useSalaryAccessStore = defineStore('salaryAccessStore', {
  state: () => ({
    visible: false,
    loading: false,
    statusLoading: false,
    // 'auto' — 403 sababli (o'rnatish yoki ochish); 'change' — parolni o'zgartirish.
    intent: 'auto',
    hasPassword: false,
    unlocked: false,
    unlockedUntil: null,
    ttlSeconds: 0,
    // 403 sababli kutib turgan so'rovlar: { config, resolve, reject }
    _queue: [],
    _timer: null
  }),
  actions: {
    // Interceptor: bloklangan so'rovni navbatga qo'yadi va modalni ochadi.
    enqueue(item) {
      this._queue.push(item)
    },
    open() {
      this.intent = 'auto'
      this.visible = true
      this._status()
    },
    // Oylik parolini o'zgartirish (foydalanuvchi toolbar tugmasidan).
    openChange() {
      this.intent = 'change'
      this.visible = true
      this._status()
    },
    close() {
      this.visible = false
      // Foydalanuvchi bekor qildi — kutayotgan so'rovlarni rad etamiz (osilib qolmasin).
      this._rejectQueue(new Error(t('salaryAccess.cancelled')))
    },

    _status() {
      this.statusLoading = true
      return salary1cService
        ._salaryAccessStatus()
        .then((res) => {
          const d = res.data.data
          this.hasPassword = !!d.has_password
          this.unlocked = !!d.unlocked
          this.unlockedUntil = d.unlocked_until ?? null
          this.ttlSeconds = Number(d.ttl_seconds || 0)
          if (this.unlocked) this._scheduleAutoLock(this.ttlSeconds)
        })
        .finally(() => {
          this.statusLoading = false
        })
    },

    // Modal submit — 3 rejim: 'change' (eski→yangi), 'set' (birinchi marta), 'unlock'.
    async submit(form) {
      this.loading = true
      try {
        if (this.intent === 'change' && this.hasPassword) {
          await salary1cService._salaryAccessSetPassword({
            data: { new_password: form.new_password, old_password: form.old_password }
          })
          // Parol o'zgargach backend sessiyalarni yopadi — yangi parol bilan qayta ochamiz.
          await this._doUnlock(form.new_password)
        } else if (!this.hasPassword) {
          await salary1cService._salaryAccessSetPassword({
            data: { new_password: form.new_password, login_password: form.login_password }
          })
          this.hasPassword = true
          await this._doUnlock(form.new_password)
        } else {
          await this._doUnlock(form.password)
        }
        this.intent = 'auto'
        this.visible = false
        this._flushQueue()
      } catch (e) {
        // Xato (masalan noto'g'ri parol, 422) — interceptor toast ko'rsatadi.
        // Modal ochiq qoladi, foydalanuvchi qayta urinadi. Bu yerda yutamiz
        // (aks holda unhandled rejection console'ni ifloslaydi).
      } finally {
        this.loading = false
      }
    },

    async _doUnlock(password) {
      const res = await salary1cService._salaryAccessUnlock({ data: { password } })
      const d = res.data.data
      this.unlocked = true
      this.unlockedUntil = d.unlocked_until ?? null
      this.ttlSeconds = Number(d.ttl_seconds || 0)
      this._scheduleAutoLock(this.ttlSeconds)
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
