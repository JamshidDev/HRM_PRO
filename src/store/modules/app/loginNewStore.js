import { defineStore } from 'pinia'
import router from '@/router/index.js'
import { AppPaths, useAppSetting, isPasswordExpiredError } from '@/utils/index.js'
import { useAccountStore, useSocketStore } from '@/store/modules/index.js'
import { getActivePinia } from 'pinia'
import { getLoginDeviceData } from '@/utils/webPush.js'
import { dpopProof } from '@/service/dpop.js'

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
    // SSO: tashqi tizim `?client_id=` bilan yuborgan bo'lsa — { client_id, name }.
    sso: null,
    ssoLoading: false,
    // Brauzerda yaroqli HRM sessiyasi bor — qayta login so'ralmaydi ({ name }).
    ssoSession: null,
    ssoSessionChecking: false,
    // Qaysi usulda kirildi (password | qr | eimzo) — SSO tarixiga yoziladi.
    loginMethod: 'password',
    // Login'dan keyin to'liq ekranli yo'naltirish oynasi uchun — { name, url }.
    ssoRedirect: null,
    // custom (rasm) captcha — login sahifasidagidek
    captchaAnswer: null,
    captchaKey: null,
    // two-step verification (2FA) — ENABLE_2FA = true bo'lganda ishlatiladi
    twoFactorRequired: false,
    twoFactorToken: null,
    code: null,
    codeError: null,
    showReSendButton: false,
    otpExpireTime: otpExpireTime,
    // Offerta oqimi — login javobida `offer:true` kelsa modal ochiladi va login
    // yakunlanmaydi. Token "Tanishdim" bosilgunча localStorage'ga saqlanmaydi.
    showOfferModal: false,
    pendingToken: null,
    offerLoading: false,
    // Parol muddati o'tgani uchun backend kirishga ruxsat bermadi. Bu oddiy
    // login xatosi emas: foydalanuvchi parolni Telegram bot orqali tiklashi
    // kerak, shuning uchun login sahifasi alohida ekranga o'tadi.
    passwordExpired: false,
    passwordExpiredMessage: null
  }),
  getters: {
    // +998(90)1234567 -> 901234567
    rawPhone: (state) => state.phone?.slice(4).replace('(', '').replace(')', '') || ''
  },
  actions: {
    async _auth(onError) {
      this.loading = true

      // Qurilma id + brauzer push tokeni login bilan birga ketadi (alohida API yo'q).
      const device = await getLoginDeviceData()
      let data = {
        phone: this.rawPhone,
        password: this.password,
        captcha_key: this.captchaKey,
        captcha_answer: this.captchaAnswer,
        ...device
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
        .catch((error) => {
          // xato bo'lsa captcha javobini tozalab, rasmni yangilaymiz
          this.captchaAnswer = null
          if (isPasswordExpiredError(error)) {
            // Backend bergan matn bo'lsa o'shani ko'rsatamiz (u aniqroq:
            // masalan necha kun o'tganini aytishi mumkin), aks holda o'zimiznikini.
            this.passwordExpiredMessage = error.response?.data?.message ?? null
            this.passwordExpired = true
          }
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
    // Parol muddati ekranidan login formaga qaytish.
    clearPasswordExpired() {
      this.passwordExpired = false
      this.passwordExpiredMessage = null
    },
    // 2FA qadamidan login formaga qaytish
    cancelTwoFactor() {
      this.twoFactorRequired = false
      this.twoFactorToken = null
      this.code = null
      this.codeError = null
    },
    // login va 2FA muvaffaqiyatli token olgandan keyingi umumiy oqim
    _handleAuthSuccess(res, method = 'password') {
      const token = res.data.access_token
      this.loginMethod = method

      // offer=true → offerta HALI qabul qilinmagan. Login yakunlanmaydi:
      // token'ni vaqtincha ushlaymiz (localStorage'ga YOZMAYMIZ) va modalni ochamiz.
      // "Tanishdim"да `_acceptOfferAndContinue` login'ni davom ettiradi;
      // rad etsa `_declineOffer` — modal yopiladi, shu sahifada qoladi.
      if (res.data.offer === true) {
        this.pendingToken = token
        this.showOfferModal = true
        return
      }

      this._finalizeLogin(token)
    },
    // Token'ni saqlab, login'ni yakunlaydi (offer tekshiruvidan keyin chaqiriladi).
    // must_change endi login javobida EMAS — `/user/profile` orqali keladi
    // (accountStore._index uni o'rnatadi).
    _finalizeLogin(token) {
      localStorage.setItem(useAppSetting.tokenKey, token)

      if (this.sso) {
        this._ssoRedirect()
        return
      }

      const accountStore = useAccountStore()
      const socketStore = useSocketStore()
      socketStore.disconnect()

      accountStore._index(async (data) => {
        getActivePinia().reset()
        socketStore.initSocket(token, data?.id)
        localStorage.setItem(useAppSetting.accountUserId, data.id)
        await nextTick()
        await router.push(AppPaths.Home)
      })
    },
    // Offerta modalidagi "Tanishdim" — bazaga yozadi, keyin login davom etadi.
    _acceptOfferAndContinue() {
      if (!this.pendingToken) return
      this.offerLoading = true
      $ApiService.accountService
        ._acceptOffer({ token: this.pendingToken })
        .then(() => {
          const token = this.pendingToken
          this.showOfferModal = false
          this.pendingToken = null
          this._finalizeLogin(token)
        })
        .finally(() => {
          this.offerLoading = false
        })
    },
    // Offerta rad etildi — modal yopiladi, login yakunlanmaydi (shu sahifada qoladi).
    _declineOffer() {
      this.showOfferModal = false
      this.pendingToken = null
    },
    // Login sahifasi `?client_id=` bilan ochilganda: tizim SSO'ga ulanganini tekshiradi.
    _loadSsoClient(clientId) {
      this.sso = null
      if (!clientId) return
      this.ssoLoading = true
      $ApiService.authService
        ._ssoClient({ params: { client_id: clientId } })
        .then((res) => {
          this.sso = { client_id: clientId, name: res.data.data.name }
        })
        // Ulanmagan tizim — oddiy login kabi HRM'ga kiriladi.
        .catch(() => {})
        .finally(() => {
          this.ssoLoading = false
        })
    },
    // `client_id` bilan kelinganda: brauzerdagi token yaroqlimi (axios'siz — 401 client_id'ni yo'qotmasin).
    async _checkSsoSession() {
      const token = localStorage.getItem(useAppSetting.tokenKey)
      if (!token) return
      this.ssoSessionChecking = true
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/v1/user/profile`
        const proof = await dpopProof('GET', url, token).catch(() => null)
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Auth-Type': 'sanctum',
            ...(proof ? { DPoP: proof } : {})
          }
        })
        if (res.ok) {
          const w = (await res.json())?.data?.worker
          this.ssoSession = { name: [w?.last_name, w?.first_name].filter(Boolean).join(' ') }
        } else if (res.status === 401) {
          localStorage.removeItem(useAppSetting.tokenKey)
        }
      } catch {
        // tarmoq xatosi — oddiy login oqimi
      } finally {
        this.ssoSessionChecking = false
      }
    },
    // Mavjud sessiya bilan tizimga o'tish — login so'ralmaydi.
    _ssoContinueSession() {
      this.loginMethod = 'session'
      this._ssoRedirect()
    },
    // «Boshqa akkaunt bilan kirish» — sessiya shu brauzerdan olib tashlanadi, login ochiladi.
    _ssoUseOtherAccount() {
      localStorage.removeItem(useAppSetting.tokenKey)
      this.ssoSession = null
      this.ssoRedirect = null
    },
    // Bir martalik client_code olib, to'liq ekranli yo'naltirish oynasini ochadi.
    _ssoRedirect() {
      this.loading = true
      const data = { client_id: this.sso.client_id, method: this.loginMethod }
      $ApiService.authService
        ._ssoCode({ data })
        .then((res) => {
          this.ssoRedirect = res.data.data
        })
        .catch(() => {
          // Yo'naltirib bo'lmasa — oddiy login kabi HRM'ga kiramiz.
          this.sso = null
          this._finalizeLogin(localStorage.getItem(useAppSetting.tokenKey))
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
})
