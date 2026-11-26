import { defineStore } from 'pinia'
import {
  defaultScopeType,
  syncDeptScopePermission,
  toApiPayload
} from '@/pages/admin/role/roleScope.js'
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
      // Kodda ishlatiladigan kalit (masalan HRAsistent) — yaratilgandan keyin o'zgarmaydi.
      key: null,
      // Foydalanuvchiga ko'rinadigan nom (masalan "HR yordamchisi").
      name: null,
      // Rol turi: 'sanctum' (foydalanuvchi roli) yoki 'integration' (client roli).
      // Guard rolning permission olamini belgilaydi (ikkovidan bittasi).
      guard_name: 'sanctum',
      // Kesim: 'organization' | 'department'. Integration'da null.
      scope_level: 'organization',
      // Doira: organization → single | subtree | all; department → selected.
      scope_type: 'single',
      permissions: []
    },
    // Kesim almashganda olib tashlanadigan ruxsatlar tasdig'i: { level, ids }.
    pendingLevel: null,
    // Forma qadami: 'settings' (rol sozlamalari) | 'permissions' (ruxsatlar).
    formTab: 'settings',
    params: {
      page: 1,
      per_page: 15,
      search: null,
      guard: null,
      scope_level: null,
      scope_type: null,
      permission_id: null
    },
    query: null
  }),
  actions: {
    // Saqlanadigan body: kesimga mos `scope-departments` bilan (sanctum rollarda).
    _body() {
      const p = { ...this.payload }
      if (p.guard_name === 'sanctum')
        p.permissions = syncDeptScopePermission(p.permissions, p.scope_level, this.originAllPermissionList)
      return toApiPayload(p)
    },
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
        ._create({ data: this._body() })
        .then(() => {
          this.visible = false
          this._index()
          // Toast interceptor'da (backend'ning tarjimali message'i) — bu yerda takrorlanmaydi.
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      $ApiService.userRoleService
        ._update({ data: this._body(), id: this.elementId })
        .then(() => {
          this.visible = false
          this._index()
          // Toast interceptor'da (backend'ning tarjimali message'i) — bu yerda takrorlanmaydi.
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
    // Guard almashganda: permissionlar tozalanadi, doira moslanadi, ro'yxat qayta yuklanadi.
    onGuardChange() {
      this.payload.permissions = []
      this.query = null
      this.pendingLevel = null
      // Integration doira ishlatmaydi.
      if (this.payload.guard_name === 'integration') {
        this.payload.scope_level = null
        this.payload.scope_type = null
      } else if (!this.payload.scope_level) {
        this.payload.scope_level = 'organization'
        this.payload.scope_type = defaultScopeType('organization')
      }
      this._getAllPermission()
    },
    // Kesim almashtirish; `incompatibleIds` — yangi kesimda ishlamaydigan tanlangan ruxsatlar.
    setScopeLevel(level, incompatibleIds = []) {
      if (level === this.payload.scope_level) return
      if (incompatibleIds.length) {
        this.pendingLevel = { level, ids: incompatibleIds }
        return
      }
      this.applyScopeLevel(level)
    },
    applyScopeLevel(level, removeIds = []) {
      if (removeIds.length) {
        const drop = new Set(removeIds)
        this.payload.permissions = this.payload.permissions.filter((id) => !drop.has(id))
      }
      this.payload.scope_level = level
      this.payload.scope_type = defaultScopeType(level)
      this.pendingLevel = null
    },
    confirmPendingLevel() {
      if (this.pendingLevel) this.applyScopeLevel(this.pendingLevel.level, this.pendingLevel.ids)
    },
    cancelPendingLevel() {
      this.pendingLevel = null
    },
    resetForm() {
      this.elementId = null
      this.payload.key = null
      this.payload.name = null
      this.payload.guard_name = 'sanctum'
      this.payload.scope_level = 'organization'
      this.payload.scope_type = defaultScopeType('organization')
      this.payload.permissions = []
      this.pendingLevel = null
      this.formTab = 'settings'
      this.query = null
    }
  }
})
