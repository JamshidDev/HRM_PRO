import { defineStore } from 'pinia'

const otpExpireTime = import.meta.env.VITE_OTP_EXPIRE_TIME

// Reset flow qadamlari
export const resetSteps = {
  request: 'request',
  code: 'code',
  password: 'password'
}

export const useResetPasswordStore = defineStore('resetPasswordStore', {
  state: () => ({
    phone: '+998',
    step: resetSteps.request,
    code: null,
    password: null,
    confirmPassword: null,
    loading: false,
    errorMessage: null,
    resetToken: null,
    showReSendButton: false,
    otpExpireTime: otpExpireTime
  }),
  getters: {
    // +998(90)1234567 -> 901234567
    rawPhone: (state) => state.phone?.slice(4).replace('(', '').replace(')', '') || ''
  },
  actions: {
    // login formadan telefonni olib reset flowni boshlaydi
    start(phone) {
      this.$reset()
      if (phone) this.phone = phone
    },
    // 1-qadam: tiklash kodini yuborish
    _sendCode() {
      this.errorMessage = null
      this.loading = true
      const data = { phone: this.rawPhone }
      $ApiService.authService
        ._forgotPassword({ data })
        .then((res) => {
          this.resetToken = res.data?.data?.user ?? res.data?.data ?? null
          this.step = resetSteps.code
          this.showReSendButton = false
          this.otpExpireTime = otpExpireTime
        })
        .catch((error) => {
          this.errorMessage = error.response?.data?.message
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 2-qadam: kiritilgan kodni tekshirish
    _verifyCode() {
      this.errorMessage = null
      this.loading = true
      const data = {
        phone: this.rawPhone,
        code: this.code,
        user: this.resetToken
      }
      $ApiService.authService
        ._verifyResetCode({ data })
        .then((res) => {
          // backend yangi token qaytarsa saqlab qolamiz
          this.resetToken = res.data?.data?.user ?? res.data?.data ?? this.resetToken
          this.step = resetSteps.password
        })
        .catch((error) => {
          this.errorMessage = error.response?.data?.message
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 3-qadam: yangi parolni saqlash. onSuccess login tabga qaytarish uchun
    _resetPassword(onSuccess) {
      this.errorMessage = null
      this.loading = true
      const data = {
        phone: this.rawPhone,
        code: this.code,
        user: this.resetToken,
        password: this.password
      }
      $ApiService.authService
        ._resetPassword({ data })
        .then(() => {
          onSuccess?.()
        })
        .catch((error) => {
          this.errorMessage = error.response?.data?.message
        })
        .finally(() => {
          this.loading = false
        })
    },
    // kodni qayta yuborish
    reSendCode() {
      this.showReSendButton = false
      this._sendCode()
    },
    onFinish() {
      this.showReSendButton = true
      this.otpExpireTime = otpExpireTime
    }
  }
})
