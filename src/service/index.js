import axios from 'axios'
import { AppPaths, useAppSetting } from '@/utils/index.js'
import router from '../router/index'
import Utils from '@/utils/Utils.js'
import i18n from '@/i18n/index.js'
const apiUrl = import.meta.env.VITE_API_URL
console.log(apiUrl)
const { t } = i18n.global
const instance = axios.create({
  baseURL: `${apiUrl}/api`
})

let isLoggingOut = false

instance.interceptors.request.use(function (config) {
  let token = localStorage.getItem(useAppSetting.tokenKey) || null
  config.headers['Accept-Language'] =
    localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
  config.headers['Access-Control-Allow-Origin'] = '*'

  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }

  if (config.url !== '/auth/login') {
    config.headers['X-Auth-Type'] = 'sanctum'
  }

  return config
})

instance.interceptors.response.use(
  (response) => {
    if (
      [Utils.methodTypes.PUT, Utils.methodTypes.POST, Utils.methodTypes.DELETE].includes(
        response.config.method
      )
    ) {
      if (
        !response.data?.error &&
        response?.data?.message &&
        typeof response.data?.message === 'string'
      ) {
        $Toast.success(response.data.message.toString())
      }
    }
    isLoggingOut = false
    return Promise.resolve(response)
  },
  async (error) => {
    if (error.name === 'CanceledError') {
      error.message = t('content.waitResponse')
    }

    if (error.response?.status === 401) {
      const serviceUrl = error.response?.config?.url?.toString()
      if(serviceUrl.includes('auth/login')){
        $Toast.error(error.response?.data?.message ?? error.message)
        return Promise.reject(error)
      }

      if (isLoggingOut){
        return Promise.reject(error)
      }

      if (!error.response.request.responseURL.includes(AppPaths.Profile)) {
        $Toast.error(error.response.data.message)
      }
      isLoggingOut = true
      localStorage.removeItem(useAppSetting.tokenKey)
      await router.push(AppPaths.Login)
    } else if (error.response?.data?.message) {
      $Toast.error(error.response?.data?.message)
    } else if (error?.message) {
      $Toast.warning(error.message)
    }

    return Promise.reject(error)
  }
)

export default instance
