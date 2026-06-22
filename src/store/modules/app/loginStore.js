import { defineStore } from 'pinia'
import router from '@/router/index.js'
import { AppPaths, useAppSetting } from '@/utils/index.js'
import { useAccountStore, useSocketStore } from '@/store/modules/index.js'
import { getActivePinia } from 'pinia'
import { useRoute } from 'vue-router'

export const useLoginStore = defineStore('loginStore', {
  state: () => ({
    phone: '+998',
    password: null,
    captchaAnswer: null,
    captchaKey: null,
    loading: false,
    authPayload: null
  }),
  getters: {},
  actions: {
    _auth(onError) {
      const accountStore = useAccountStore()
      this.loading = true
      let data = {
        phone: this.phone.slice(4).replace('(', '').replace(')', ''),
        password: this.password,
        captcha: this.captchaAnswer,
        captcha_key: this.captchaKey
      }
      $ApiService.authService
        ._login({ data })
        .then((res) => {
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
        })
        .catch(() => {
          this.captchaAnswer = null
          onError?.()
        })
        .finally(() => {
          this.loading = false
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
