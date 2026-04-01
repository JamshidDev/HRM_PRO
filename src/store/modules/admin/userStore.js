import { defineStore } from 'pinia'
import { useAccountStore } from '@/store/modules/index.js'
import { AppPaths, useAppSetting } from '@/utils/index.js'
import router from '@/router/index.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    structureCheck: [],
    userPermissions: [],
    savePermissionLoading: false,
    payload: {
      role_id: null,
      organization_id: []
    },
    params: {
      page: 1,
      per_page: 10,
      search: null,
      organizations: [],
      role: null
    },
    roleList: [],
    roleLoading: false,

    myRoleList: [],
    myRoleLoading: false,
    loginLoading: false,
    confirmVisible: false,
    isSpam: false,
    isPermissionsVisible: false,
    userPermissionsLoading: false
  }),
  actions: {
    _onSpam() {
      this.confirmVisible = false
      this.loading = true
      $ApiService.userService
        ._onSpam({ id: this.elementId, data: { status: this.isSpam } })
        .then((res) => {})
        .finally(() => {
          this.loading = false
          this._index()
        })
    },
    _index() {
      this.loading = true
      const params = {
        ...this.params,
        organizations: this.params.organizations.map((v) => v.id).toString() || undefined
      }
      $ApiService.userService
        ._index({ params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _loginById(id, callback) {
      this.loginLoading = true
      $ApiService.userService
        ._loginByIdToSystem({ id })
        .then((res) => {
          callback(res.data.access_token)
        })
        .finally(() => {
          this.loginLoading = false
        })
    },
    _getTemporaryToken(params) {
      $ApiService.userService._temporaryToken({ params }).then((res) => {
        sessionStorage.setItem(useAppSetting.temporaryToken, res.data.data.token)
      })
    },
    _roles() {
      this.roleLoading = true
      $ApiService.userRoleService
        ._index({ params: { page: 1, per_page: 10000 } })
        .then((res) => {
          this.roleList = res.data.data.data
        })
        .finally(() => {
          this.roleLoading = false
        })
    },
    _myRoles() {
      this.myRoleLoading = true
      $ApiService.userService
        ._myRoles({ id: this.elementId })
        .then((res) => {
          this.myRoleList = res.data.data
        })
        .finally(() => {
          this.myRoleLoading = false
        })
    },
    _userPermissions() {
      this.userPermissionsLoading = true
      this.userPermissions = []
      $ApiService.userService
        ._userPermissions({ id: this.elementId })
        .then((res) => {
          this.userPermissions = res.data.data
        })
        .finally(() => {
          this.userPermissionsLoading = false
        })
    },
    _updateUserPermissions(attach_ids, detach_ids, all_user_permissions) {
      this.savePermissionLoading = true
      const promiseList = []
      if (attach_ids.length > 0) {
        promiseList.push(
          $ApiService.userService._attachPermissions({
            id: this.elementId,
            data: { permission_ids: attach_ids }
          })
        )
      }
      if (detach_ids.length > 0) {
        promiseList.push(
          $ApiService.userService._detachPermissions({
            id: this.elementId,
            data: { permission_ids: detach_ids }
          })
        )
      }
      Promise.all(promiseList)
        .then((res) => {
          this._index()
          this.userPermissions = all_user_permissions
        })
        .finally(() => {
          this.savePermissionLoading = false
        })
    },
    _create() {
      this.saveLoading = true
      const data = {
        ...this.payload,
        uuid: this.elementId,
        organization_id: this.payload.organization_id[0].id
      }
      $ApiService.userService
        ._create({ data })
        .then((res) => {
          this.payload.role_id = null
          this.payload.organization_id = []
          this._myRoles()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      const data = {
        ...this.payload,
        uuid: this.elementId,
        organization_id: this.payload.organization_id[0].id
      }
      $ApiService.userService
        ._update({ data, id: this.elementId })
        .then((res) => {
          this._myRoles()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.userService
        ._delete({ id: this.elementId })
        .then((res) => {})
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openVisible(visible) {
      this.visible = visible
    }
  }
})
