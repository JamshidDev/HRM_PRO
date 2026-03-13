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
    loading: false,
    authPayload: null
  }),
  getters: {},
  actions: {
    _auth() {
      const accountStore = useAccountStore()
      this.loading = true
      let data = {
        phone: this.phone.slice(4).replace('(', '').replace(')', ''),
        password: this.password
      }
      $ApiService.authService
        ._login({ data })
        .then((res) => {
          const token = res.data.access_token
          localStorage.setItem(useAppSetting.tokenKey, token)

          if (this.authPayload) {
            this._getAuthCode()
            return
          }

          const socketStore = useSocketStore()
          socketStore.disconnect()

          getActivePinia().reset()

          accountStore._index(async (data) => {
            socketStore.initSocket(token, data?.id)
            localStorage.setItem(useAppSetting.accountUserId, data.id)
            await nextTick()
            await router.push(AppPaths.Home)
          })
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
