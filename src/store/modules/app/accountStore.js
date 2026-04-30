import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import router from '@/router/index.js'
import { AppPaths, useAppSetting, appPermissions } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global
export const useAccountStore = defineStore('accountStore', {
  state: () => ({
    account: null,
    saveLoading: false,
    loading: false,
    activeTab: 1,
    tabs: [1, 2, 3, 4, 5],
    payload: {
      password: null
    },
    orgPayload: {
      command_address: null,
      city_id: null,
      address: null
    },
    region_id: null,
    accountImage: null,
    organizationVisible: false,
    activeRole: null,
    roleLoading: false,
    roleList: [],
    permissions: [],
    storageUpdate: 1,
    pn: appPermissions,
    isModeDev: false,
    skipReset: true,
    districtList: [],
    districtLoading: false,
    orgLoading: false,
    notificationList: [],
    notifyLoading: false,
    unReadNotificationCount: 0,
    mustChangePassword: localStorage.getItem(useAppSetting.mustChangeKey) === '1',
    changePasswordLoading: false
  }),
  getters: {
    checkPermission: (state) => (permission) => {
      const storePermissions = sessionStorage.getItem(useAppSetting.appPermission)
        ? JSON.parse(sessionStorage.getItem(useAppSetting.appPermission))
        : []
      const permissions = state.permissions.length > 0 ? state.permissions : storePermissions
      return permissions.includes(permission)
    },
    checkAction: (state) => (permission) => {
      if (!state.checkPermission(permission) && state.isModeDev) {
        $Toast.warning('Devda ligingiz uchun ruxsat berildi!')
        return true
      }
      if (!state.checkPermission(permission)) {
        $Toast.warning(t('message.noPermission'))
        return false
      }
      return true
    },
    fullName: (state) => Utils.combineFullName(state.account?.worker),
    userPhoto: (state) => state.account?.worker?.photo,
    telegramPopupVisible: (state) => {
      if (state.storageUpdate) {
        return (
          state.account?.telegram_account === 0 &&
          !localStorage.getItem(useAppSetting.telegramPopup)
        )
      }
    }
  },
  actions: {
    _logOut(callback) {
      this.loading = true
      $ApiService.accountService
        ._logOut()
        .then(() => {
          callback?.()
        })
        .finally(() => {
          this.loading = false
        })
    },
    incrementUnReadCount() {
      this.unReadNotificationCount++
    },
    _markRead(data, callback = null) {
      this.notifyLoading = true
      $ApiService.exportService._markRead({ data }).finally(() => {
        this.notifyLoading = false
        callback?.()
      })
    },
    _fetchTask() {
      this.notifyLoading = true
      $ApiService.exportService
        ._tasks({ params: { page: 1, per_page: 10 } })
        .then((res) => {
          this.notificationList = res.data.data.data
        })
        .finally(() => {
          this.notifyLoading = false
        })
    },
    _fetchUnReadNotificationCount() {
      this.notifyLoading = true
      $ApiService.exportService
        ._unReadCount()
        .then((res) => {
          this.unReadNotificationCount = res.data.data.count
        })
        .finally(() => {
          this.notifyLoading = false
        })
    },
    _getOrgInfo() {
      this.orgLoading = true
      $ApiService.accountService
        ._orgInfo()
        .then((res) => {
          this.orgPayload.command_address = res.data.data.command_name
          this.orgPayload.address = res.data.data.address
          this.orgPayload.city_id = res.data.data?.city?.id || null
          if (res.data.data.city) {
            this.region_id = res.data.data.city?.region?.id || null
            this.getDistrict()
          }
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    updateOrgInfo() {
      this.orgLoading = true
      const data = {
        ...this.orgPayload
      }
      $ApiService.accountService
        ._updateOrgInfo({ data })
        .then((res) => {
          this._getOrgInfo()
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    _index(callback) {
      const startDate = Date.now()
      this.loading = true
      $ApiService.accountService
        ._index({ data: this.payload })
        .then((res) => {
          this.payload = { ...res.data.data.worker, password: null }
          this.account = { ...res.data.data }
          this.permissions = res.data.data.role?.permissions?.map((v) => v.name)
          sessionStorage.setItem(useAppSetting.appPermission, JSON.stringify(this.permissions))
          callback?.(this.account)
        })
        .finally(() => {
          const duration = Date.now() - startDate
          if (duration < 500) {
            setTimeout(() => {
              this.loading = false
            }, 500)
          }
          this.loading = false
        })
    },
    changeRegion() {
      this.orgPayload.city_id = null
      this.getDistrict()
    },
    getDistrict() {
      this.districtLoading = true
      $ApiService.districtService
        ._index({ params: { page: 1, per_page: 1000, region_id: this.region_id } })
        .then((res) => {
          this.districtList = res.data.data.data
        })
        .finally(() => {
          this.districtLoading = false
        })
    },
    _update() {
      let data = { ...this.payload, photo: null }
      $ApiService.accountService
        ._update({ data })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _changePassword(password) {
      this.changePasswordLoading = true
      return $ApiService.accountService
        ._update({ data: { password } })
        .then(() => {
          this.mustChangePassword = false
          localStorage.removeItem(useAppSetting.mustChangeKey)
        })
        .finally(() => {
          this.changePasswordLoading = false
        })
    },
    _updateAvatar() {
      let data = {
        password: null,
        first_name: this.account.first_name,
        last_name: this.account.last_name,
        middle_name: this.account.middle_name,
        user: this.account.uuid,
        photo: this.accountImage
      }
      $ApiService.accountService
        ._update({ data })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _roles() {
      this.roleLoading = true
      $ApiService.accountService
        ._roles()
        .then((res) => {
          this.roleList = []
          res.data.data.map((v) => {
            v.organizations.forEach((x) => {
              if (x.current) {
                this.activeRole = x.id
              }
              this.roleList.push({ ...x, role: v.name })
            })
          })
        })
        .finally(() => {
          this.roleLoading = false
        })
    },
    _changeRole(id) {
      let data = {
        organization_id: id
      }
      $ApiService.accountService._changeRole({ data }).then((res) => {
        this._index()
        router.push(AppPaths.Home)
      })
    },
    resetForm() {
      this.payload.password = null
      this.payload.first_name = null
      this.payload.last_name = null
      this.payload.middle_name = null
      this.payload.user = null
      this.payload.photo = null
    },
    openRoleModal() {
      this.organizationVisible = true
      this._roles()
    },
    changeAccount(id) {
      if (id !== this.activeRole) {
        this.activeRole = id
        this._changeRole(id)
      }
    },
    hideTelegramPopup() {
      localStorage.setItem(useAppSetting.telegramPopup, 1)
      this.storageUpdate++
    }
  }
})
