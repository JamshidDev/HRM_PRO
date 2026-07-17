import { defineStore } from 'pinia'

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
    resetToken: null
  }),
  getters: {
    // +998(90)1234567 -> 901234567 (bot bilan bir xil standart: prefikssiz 9-xonali).
    // password-reset/verify aynan shu formatni kutadi (backend baribir oxirgi 9 raqamni oladi).
    rawPhone: (state) => state.phone?.slice(4).replace('(', '').replace(')', '') || '',
    // +998(90)1234567 -> 998901234567 (eski 12-xonali format; hozir ishlatilmaydi).
    fullPhone: (state) => state.phone?.replace(/[+()]/g, '') || ''
  },
  actions: {
    // login formadan telefonni olib reset flowni boshlaydi
    start(phone) {
      this.$reset()
      if (phone) this.phone = phone
    },
    // 1-qadam: telefonni tasdiqlab kod kiritish qadamiga o'tish (kod Telegram bot orqali keladi,
    // backendda alohida "kod yuborish" endpointi yo'q)
    _sendCode() {
      this.errorMessage = null
      this.step = resetSteps.code
    },
    // 2-qadam: kiritilgan kodni tekshirish
    _verifyCode() {
      this.errorMessage = null
      this.loading = true
      const data = {
        phone: this.rawPhone,
        code: this.code
      }
      $ApiService.authService
        ._verifyResetCode({ data })
        .then((res) => {
          this.resetToken = res.data?.data?.reset_token ?? res.data?.reset_token ?? res.data?.data ?? null
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
        reset_token: this.resetToken,
        new_password: this.password
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
    }
  }
})
