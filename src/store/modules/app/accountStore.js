import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import router from '@/router/index.js'
import { AppPaths, useAppSetting, appPermissions } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'

const { t } = i18n.global

/**
 * sessionStorage'dagi ruxsat ro'yxatini XAVFSIZ o'qiydi.
 *
 * Nega kerak: ilgari `_index()` `role?.permissions?.map(...)` natijasini to'g'ridan-to'g'ri
 * yozardi. Rol `null` bo'lsa bu `undefined` bo'lib, `JSON.stringify(undefined)` → `undefined`,
 * ya'ni storage'ga `"undefined"` SATRI tushardi. Keyingi `JSON.parse("undefined")` esa
 * exception tashlab, har bir permission tekshiruvini yiqitardi. Bunday "zaharlangan"
 * qiymat allaqachon tarqalgan build'lardan foydalanuvchilarda qolgan bo'lishi mumkin,
 * shuning uchun uni shu yerda tozalaymiz.
 */
const readStoredPermissions = () => {
  try {
    const raw = sessionStorage.getItem(useAppSetting.appPermission)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    sessionStorage.removeItem(useAppSetting.appPermission)
    return []
  }
}

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
    // Sahifa yangilanganda bir marta hidratsiya qilinadi. Ilgari bu `[]` edi va har bir
    // `checkPermission` chaqiruvi sessionStorage'ni qayta o'qib parse qilardi.
    permissions: readStoredPermissions(),
    // Shu tab hayoti davomida profil (va u bilan ruxsatlar) serverdan olindimi.
    // Storage'dan hidratsiya buni `true` qilmaydi — har tab ochilishida bir marta
    // yangilanadi, aks holda admin rolni o'zgartirsa eski ruxsatlar qolib ketardi.
    permissionsLoaded: false,
    storageUpdate: 1,
    pn: appPermissions,
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
    /**
     * Ruxsatlarning keshlangan Set'i. `permissions` o'zgarmaguncha qayta hisoblanmaydi.
     * Ilgari har tekshiruv sessionStorage.getItem + JSON.parse qilardi — sidebar'ning
     * bitta render'i ~600 elementli massivni yuzlab marta parse qilishga olib kelardi.
     */
    permissionSet: (state) => new Set(state.permissions),

    /** Aniq slug bo'yicha tekshiruv. Yon ta'sirsiz — template'da bemalol ishlatiladi. */
    checkPermission: (state) => (permission) => state.permissionSet.has(permission),

    /**
     * KO'RISH ruxsati: bare slug YOKI uning '-read' varianti.
     *
     * `navigations.js` tarixan bare slug saqlaydi (`hr-workers`), fine-grained
     * migratsiyadan keyin esa rollar `hr-workers-read` oladi. Ikkovini ham qamraymiz.
     * Bu qoida SIDEBAR va ROUTER uchun yagona manba — ilgari u ikki joyda takrorlanardi.
     */
    canView: (state) => (prefix) =>
      state.checkPermission(prefix) || state.checkPermission(`${prefix}-read`),

    /** `canDo('hr-workers', 'write')` — slug'ni qo'lda yig'ish o'rniga. */
    canDo: (state) => (prefix, action) => state.checkPermission(`${prefix}-${action}`),

    /**
     * Amalni bajarishdan oldingi qo'riqchi: rad etilsa toast chiqaradi.
     * DIQQAT: yon ta'sirli — `v-if` / `computed` ichida ISHLATILMASIN, aks holda
     * har render'da toast chiqadi. Ko'rinish uchun `checkPermission`/`canView` ishlatiladi.
     */
    checkAction: (state) => (permission) => {
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
    /**
     * Rolni SIMULYATSIYA qilish (faqat dev build'da).
     *
     * Ilgari `isModeDev` localhost'da hamma ruxsatni ochib berardi — natijada
     * permissionlarni lokalda umuman sinab bo'lmasdi. Uning o'rniga endi aniq
     * ruxsat ro'yxatini majburlash mumkin:
     *   localStorage.setItem('permOverride', JSON.stringify(['hr','hr-workers-read']))
     * Tozalash: localStorage.removeItem('permOverride')
     */
    applyDevPermissionOverride() {
      if (!import.meta.env.DEV) return
      const raw = localStorage.getItem('permOverride')
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) this.permissions = parsed
      } catch {
        localStorage.removeItem('permOverride')
      }
    },

    /**
     * Chiqishda ruxsatlarni ANIQ tozalaydi.
     * `skipReset: true` bo'lgani uchun `getActivePinia().reset()` bu store'ni chetlab
     * o'tadi — ya'ni chiqmasdan boshqa foydalanuvchi kirsa, eski ruxsatlar qolib ketardi.
     */
    clearPermissions() {
      this.permissions = []
      this.permissionsLoaded = false
      this.account = null
      sessionStorage.removeItem(useAppSetting.appPermission)
    },

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
      return $ApiService.accountService
        ._index({ data: this.payload })
        .then((res) => {
          this.payload = { ...res.data.data.worker, password: null }
          this.account = { ...res.data.data }
          // `?? []` MAJBURIY: rol biriktirilmagan foydalanuvchida `role` null bo'lib,
          // ilgari storage'ga `"undefined"` satri yozilar va keyingi parse yiqilardi.
          const rolePermissions = res.data.data.role?.permissions
          this.permissions = Array.isArray(rolePermissions)
            ? rolePermissions.map((v) => v.name)
            : []
          sessionStorage.setItem(useAppSetting.appPermission, JSON.stringify(this.permissions))
          this.applyDevPermissionOverride()
          this.permissionsLoaded = true
          // must_change endi login javobida EMAS — profil (/user/profile) qaytaradi.
          // true → parol muddati o'tgan. Ilgari bu MAJBURIY modal ochardi (login'dan
          // keyin yopib bo'lmasdi) — modal OLIB TASHLANDI; bayroq faqat profil
          // sahifasidagi "Parol" tabini belgilash uchun qoladi (`profile/ui/Tabs.vue`).
          this.mustChangePassword = res.data.data.must_change === true
          if (this.mustChangePassword) {
            localStorage.setItem(useAppSetting.mustChangeKey, '1')
          } else {
            localStorage.removeItem(useAppSetting.mustChangeKey)
          }
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
              // Kompozit kalit: role_id-org_id (bir xil org'да bir nechta rol
              // bo'lganда ajratish uchun). Active = backend `current` (is_active).
              const key = `${v.id}-${x.id}`
              if (x.current) {
                this.activeRole = key
              }
              this.roleList.push({ ...x, role_id: v.id, role: v.name, key })
            })
          })
        })
        .finally(() => {
          this.roleLoading = false
        })
    },
    _changeRole(item) {
      // Active rolni ko'chirish: org + aniq role_id (bir xil org'даgi rollarni
      // ajratish uchun). Backend is_active'ni shu (role, org)ga o'rnatadi.
      let data = {
        organization_id: item.id,
        role_id: item.role_id
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
    changeAccount(item) {
      if (item.key !== this.activeRole) {
        this.activeRole = item.key
        this._changeRole(item)
      }
    },
    hideTelegramPopup() {
      localStorage.setItem(useAppSetting.telegramPopup, 1)
      this.storageUpdate++
    }
  }
})
