import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useUserRoleStore = defineStore('userRole', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,
    totalItems: 0,
    allPermissionList: [],
    originAllPermissionList: [],
    payload: {
      name: null,
      // Rol turi: 'sanctum' (foydalanuvchi roli) yoki 'integration' (client roli).
      // Guard rolning permission olamini belgilaydi (ikkovidan bittasi).
      guard_name: 'sanctum',
      permissions: []
    },
    params: {
      page: 1,
      per_page: 15,
      search: null
    },
    query: null
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.userRoleService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    _create() {
      this.saveLoading = true
      $ApiService.userRoleService
        ._create({ data: this.payload })
        .then((res) => {
          this.visible = false
          this._index()
          $Toast.success(t('categoryPage.toast.successUpdate'))
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      $ApiService.userRoleService
        ._update({ data: this.payload, id: this.elementId })
        .then((res) => {
          this.visible = false
          this._index()
          $Toast.success(t('categoryPage.toast.successUpdate'))
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.userRoleService
        ._delete({ id: this.elementId })
        .then((res) => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    /**
     * Rol guard'iga mos BARCHA permissionlarni yuklaydi (sanctum yoki integration).
     *
     * Sahifalab yuklanadi: ilgari bitta so'rov `per_page: 1000` bilan ketardi va
     * jadval shu chegaradan oshsa, tanlangan ID'lar ro'yxatga tushmasdi. Bunday
     * grant rol formasida hech bir switchda ko'rinmas, o'chirib ham bo'lmas,
     * lekin saqlashda jimgina qolib ketardi.
     */
    async _getAllPermission() {
      const perPage = 500
      const guard = this.payload.guard_name || 'sanctum'
      const collected = []
      let page = 1
      let total = Infinity

      try {
        while (collected.length < total) {
          const res = await $ApiService.userPermissionService._index({
            params: { page, per_page: perPage, guard }
          })
          const chunk = res.data.data.data ?? []
          collected.push(...chunk)
          total = res.data.data.total ?? collected.length
          if (chunk.length === 0) break // himoya: cheksiz sikldan saqlaydi
          page += 1
        }
      } catch {
        // Xatolikda ham qo'lga kirgani ko'rsatiladi — forma butunlay bo'sh qolmasin.
      }

      const sorted = collected.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      )
      this.allPermissionList = sorted
      this.originAllPermissionList = sorted
    },
    openVisible(data) {
      this.visible = data
    },
    resetForm() {
      this.elementId = null
      this.payload.name = null
      this.payload.guard_name = 'sanctum'
      this.payload.permissions = []
      this.query = null
    }
  }
})
