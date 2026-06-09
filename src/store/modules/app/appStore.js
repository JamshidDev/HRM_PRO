import { defineStore } from 'pinia'
import router from '@/router/index.js'
import { AppPaths, useAppSetting } from '@/utils/index.js'
import { customTheme } from '@/assets/theme/theme.js'
import i18n from '@/i18n/index.js'
import updateLocale from 'dayjs/plugin/updateLocale'
import dayjs from 'dayjs'
import { getActivePinia } from 'pinia'

dayjs.extend(updateLocale)
dayjs.updateLocale('uz', {
  months: [
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'Iyun',
    'Iyul',
    'Avgust',
    'Sentabr',
    'Oktabr',
    'Noyabr',
    'Dekabr'
  ],
  monthsShort: [
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'Iyun',
    'Iyul',
    'Avgust',
    'Sentabr',
    'Oktabr',
    'Noyabr',
    'Dekabr'
  ],
  weekdays: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
  weekdaysShort: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']
})
export const useAppStore = defineStore('appStore', {
  state: () => ({
    appConfig: {
      signatureLogin: true
    },
    mapLocation: {
      center: [69.240562, 41.311081],
      zoom: 12
    },
    mapMarker: [
      {
        coords: [69.240562, 41.311081],
        name: 'Tashkent'
      }
    ],
    theme: customTheme(),
    themeSwitch: false,
    skipReset: true,
    wrongPinsLoading: false
  }),
  actions: {
    _downloadWrongWorkerPins() {
      this.wrongPinsLoading = true
      $ApiService.logService
        ._wrongWorkerPins()
        .then((res) => {
          const blob = new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `wrong-worker-pins-${dayjs().format('YYYY-MM-DD')}.xlsx`
          link.click()
          window.URL.revokeObjectURL(url)
          window.$message?.success(i18n.global.t('homePage.downloaded'))
        })
        .catch(() => {
          window.$message?.error(i18n.global.t('homePage.downloadFailed'))
        })
        .finally(() => {
          this.wrongPinsLoading = false
        })
    },
    _loginAsAdmin(token, callback) {
      $ApiService.userService._accessForAdmin({ data: { token } }).then((res) => {
        callback(res.data.data.access_token)
      })
    },
    _logOutApp() {
      localStorage.removeItem('telegramPopup')
      localStorage.removeItem('app-token')
      sessionStorage.clear()
      router?.push(AppPaths.Login)
      getActivePinia().reset()
    },
    changeTheme() {
      const mode = this.themeSwitch ? 'dark' : 'light'
      const html = document.documentElement
      html.setAttribute('data-theme', mode)
      this.theme = customTheme()
      localStorage.setItem(useAppSetting.themeKey, mode)
    },
    initApp() {
      const mode = localStorage.getItem(useAppSetting.themeKey) || useAppSetting.defaultThemeKey
      i18n.global.locale = localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage

      this.themeSwitch = mode === 'dark'
      const html = document.documentElement
      html.setAttribute('data-theme', mode)

      this.theme = customTheme()
      dayjs.locale(i18n.global.locale)
    }
  }
})
