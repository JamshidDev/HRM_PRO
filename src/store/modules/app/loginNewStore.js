import { defineStore } from 'pinia'
import router from '@/router/index.js'
import { AppPaths, useAppSetting } from '@/utils/index.js'
import { useAccountStore, useSocketStore } from '@/store/modules/index.js'
import { getActivePinia } from 'pinia'

const otpExpireTime = import.meta.env.VITE_OTP_EXPIRE_TIME

// Ikki bosqichli tasdiqlash (2FA) hozircha o'chirilgan — API hali yo'q.
// `false` bo'lsa: login muvaffaqiyatli bo'lgach 2FA oynasi ko'rsatilmaydi, to'g'ridan-to'g'ri ichkariga kiritiladi.
// Backend 2FA tayyor bo'lganda `true` qiling — o'shanda `two_factor_required` oqimi va verify/resend API ishlaydi.
const ENABLE_2FA = false

export const useLoginNewStore = defineStore('loginNewStore', {
  state: () => ({
    phone: '+998',
    password: null,
    loading: false,
    authPayload: null,
    // custom (rasm) captcha — login sahifasidagidek
    captchaAnswer: null,
    captchaKey: null,
    // two-step verification (2FA) — ENABLE_2FA = true bo'lganda ishlatiladi
    twoFactorRequired: false,
    twoFactorToken: null,
    code: null,
    codeError: null,
    showReSendButton: false,
    otpExpireTime: otpExpireTime
  }),
  getters: {
    // +998(90)1234567 -> 901234567
    rawPhone: (state) => state.phone?.slice(4).replace('(', '').replace(')', '') || ''
  },
  actions: {
    _auth(onError) {
      this.loading = true

      let data = {
        phone: this.rawPhone,
        password: this.password,
        captcha_key: this.captchaKey,
        captcha_answer: this.captchaAnswer
      }
      $ApiService.authService
        ._login({ data })
        .then((res) => {
          // 2FA yoqilgan bo'lsa va backend talab qilsa, kod qadamiga o'tamiz.
          // Hozircha ENABLE_2FA = false — shuning uchun to'g'ridan-to'g'ri ichkariga kiritamiz.
          if (ENABLE_2FA && res.data.two_factor_required === true) {
            this.twoFactorToken = res.data.token ?? res.data.data?.token ?? null
            this.code = null
            this.codeError = null
            this.showReSendButton = false
            this.otpExpireTime = otpExpireTime
            this.twoFactorRequired = true
            return
          }
          this._handleAuthSuccess(res)
        })
        .catch(() => {
          // xato bo'lsa captcha javobini tozalab, rasmni yangilaymiz
          this.captchaAnswer = null
          onError?.()
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 2FA: kiritilgan kodni tasdiqlash (ENABLE_2FA = true bo'lganda ishlatiladi)
    _verifyTwoFactor() {
      this.codeError = null
      this.loading = true
      const data = {
        phone: this.rawPhone,
        code: this.code,
        token: this.twoFactorToken
      }
      $ApiService.authService
        ._verifyTwoFactor({ data })
        .then((res) => {
          this._handleAuthSuccess(res)
        })
        .catch((error) => {
          this.codeError = error.response?.data?.message
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 2FA: kodni qayta yuborish (ENABLE_2FA = true bo'lganda ishlatiladi)
    _resendTwoFactor() {
      this.codeError = null
      this.loading = true
      const data = { phone: this.rawPhone, token: this.twoFactorToken }
      $ApiService.authService
        ._resendTwoFactor({ data })
        .then((res) => {
          this.twoFactorToken = res.data.token ?? res.data.data?.token ?? this.twoFactorToken
          this.showReSendButton = false
          this.otpExpireTime = otpExpireTime
        })
        .catch((error) => {
          this.codeError = error.response?.data?.message
        })
        .finally(() => {
          this.loading = false
        })
    },
    onFinish() {
      this.showReSendButton = true
      this.otpExpireTime = otpExpireTime
    },
    // 2FA qadamidan login formaga qaytish
    cancelTwoFactor() {
      this.twoFactorRequired = false
      this.twoFactorToken = null
      this.code = null
      this.codeError = null
    },
    // login va 2FA muvaffaqiyatli token olgandan keyingi umumiy oqim
    _handleAuthSuccess(res) {
      const accountStore = useAccountStore()
      const token = res.data.access_token
      const mustChange = res.data.must_change === true
      localStorage.setItem(useAppSetting.tokenKey, token)

      if (mustChange) {
        localStorage.setItem(useAppSetting.mustChangeKey, '1')
      } else {
        localStorage.removeItem(useAppSetting.mustChangeKey)
      }

      if (this.authPayload) {
        this._getAuthCode()
        return
      }

      const socketStore = useSocketStore()
      socketStore.disconnect()

      getActivePinia().reset()

      if (mustChange) {
        accountStore.mustChangePassword = true
      }

      accountStore._index(async (data) => {
        socketStore.initSocket(token, data?.id)
        localStorage.setItem(useAppSetting.accountUserId, data.id)
        await nextTick()
        await router.push(AppPaths.Home)
      })
    },
    _getAuthCode() {
      this.loading = true
      const data = this.authPayload
      $ApiService.authService
        ._authCode({ data })
        .then((res) => {
          window.location.href = res.data.data.url
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
})
