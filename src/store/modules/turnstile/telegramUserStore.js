import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global
export const useTelegramUserStore = defineStore('telegramUserStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    allPermissionList: [],
    structureCheck: [],
    payload: {
      user_id: null,
      devices: []
    },
    params: {
      page: 1,
      per_page: 10,
      search: null
    },
    userParam: {
      page: 1,
      per_page: 50,
      search: null
    },
    totalUserItem: 0,
    userList: [],
    userLoading: false,
    deviceList: [],
    originDeviceList: [],
    deviceLoading: false,
    editLoading: false,
    inputParam: {
      search: null,
      selectAll: false
    }
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.telegramUserService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _edit() {
      this.editLoading = true
      $ApiService.telegramUserService
        ._edit({ id: this.elementId })
        .then((res) => {
          this.payload.devices = res.data.data.map((v) => v.id)
        })
        .finally(() => {
          this.editLoading = false
        })
    },
    _alLDevice() {
      this.deviceLoading = true
      $ApiService.telegramUserService
        ._allDevices()
        .then((res) => {
          const data = res.data.data.devices.map((v) => ({
            ...v,
            position: v.status === 1 ? 'online' : 'offline'
          }))
          this.deviceList = data
          this.originDeviceList = data
        })
        .finally(() => {
          this.deviceLoading = false
        })
    },
    _create() {
      this.saveLoading = true
      let data = {
        ...this.payload
      }
      $ApiService.telegramUserService
        ._create({ data })
        .then((res) => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.loading = true
      $ApiService.telegramUserService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.loading = false
        })
    },
    _users(infinity = false) {
      this.userLoading = true
      const params = {
        ...this.userParam
      }

      $ApiService.telegramUserService
        ._users({ params })
        .then((res) => {
          this.totalUserItem = res.data.data.total
          let data = res.data.data.data.map((v) => ({
            ...v,
            name: v.last_name + ' ' + v.first_name + ' ' + v.middle_name,
            position: v.id
          }))
          this.userList = infinity ? [...this.userList, ...data] : data
        })
        .finally(() => {
          this.userLoading = false
        })
    },
    _onSearchUser(v) {
      this.userParam.page = 1
      this.userParam.search = v
      Utils.debouncedFn(this._users)
    },
    _onScrollUser(e) {
      const currentTarget = e.currentTarget
      if (
        currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight &&
        !this.userLoading &&
        this.totalUserItem > this.userList.length
      ) {
        this.userParam.page += 1
        this._users(true)
      }
    },
    onOpenUserEv(v) {
      if (!v) return
      this.userParam.search = null
      this.userParam.page = 1
      this._users()
    },
    resetForm() {
      this.payload.user_id = null
      this.payload.devices = []
    }
  }
})
