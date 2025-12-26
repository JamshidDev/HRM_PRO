import axios from 'axios'
import { AppPaths, useAppSetting } from '@/utils/index.js'
import router from '../router/index'
import Utils from '@/utils/Utils.js'
import i18n from '@/i18n/index.js'
const apiUrl = import.meta.env.VITE_API_URL

const { t } = i18n.global
const instance = axios.create({
  baseURL: `${apiUrl}/api`
})

const controllers = new Map()
function generateKey(config) {
  const { method, url } = config
  return [method, url].join('&')
}

instance.interceptors.request.use(function (config) {
  let token = localStorage.getItem(useAppSetting.tokenKey) || null
  config.headers['Accept-Language'] =
    localStorage.getItem(useAppSetting.languageKey) || useAppSetting.defaultLanguage
  config.headers['Access-Control-Allow-Origin'] = '*'
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }

  return config
})

instance.interceptors.response.use(
  (response) => {
    const key = generateKey(response.config)
    if (!response.config.meta?.skipCancel) {
      controllers.delete(key)
    }

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
    return Promise.resolve(response)
  },
  (error) => {
    if (error.name === 'CanceledError') {
      error.message = t('content.waitResponse')
    }
    if (error.response?.status === 401) {
      if (!error.response.request.responseURL.includes(AppPaths.Profile)) {
        $Toast.error(error.response.data.message)
      }
      localStorage.removeItem(useAppSetting.tokenKey)
      router.push(AppPaths.Login)
    } else if (error.response?.data?.message) {
      $Toast.error(error.response?.data?.message)
    } else if (error?.message) {
      $Toast.warning(error.message)
    }

    return Promise.reject(error)
  }
)

export default instance
