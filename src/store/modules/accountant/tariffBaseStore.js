import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

const emptyPayload = () => ({
  name: null,
  note: null,
  base_amount: null,
  min_floor: null,
  effective_date: null
})
const emptyVersionPayload = () => ({
  base_amount: null,
  min_floor: null,
  effective_date: null,
  note: null
})

// Bazaviy summa (baza) — ALOHIDA obyekt: CRUD + versiya (qiymat o'zgarishi) + tasdiqlash + tarix.
export const useTariffBaseStore = defineStore('tariffBaseStore', {
  state: () => ({
    // Ro'yxat
    list: [],
    totalItems: 0,
    loading: false,
    params: { page: 1, per_page: 10, search: null },

    // Selector uchun barcha bazalar (GridForm)
    allBases: [],

    // Ko'rish / tarix (modal)
    viewVisible: false,
    viewMode: 'view',
    detail: null,
    detailLoading: false,
    versions: [],
    versionsLoading: false,
    viewVersion: null,
    detailEditing: false, // qiymat tahriri (yangi versiya)

    // Yaratish / meta tahrir
    formVisible: false,
    formType: true, // true=create, false=edit-meta
    saveLoading: false,
    elementId: null,
    payload: emptyPayload(),

    // Versiya (baza qiymatini o'zgartirish)
    versionPayload: emptyVersionPayload(),
    versionSaveLoading: false
  }),

  actions: {
    _index() {
      this.loading = true
      $ApiService.tariffBaseService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Selector uchun (GridForm) — barcha bazalar.
    _all() {
      return $ApiService.tariffBaseService
        ._index({ params: { page: 1, per_page: 200 } })
        .then((res) => {
          this.allBases = res.data.data.data
          return this.allBases
        })
    },
    _show(id) {
      this.detailLoading = true
      this.detail = null
      this.viewVersion = null
      this.detailEditing = false
      this.elementId = id
      $ApiService.tariffBaseService
        ._show({ id })
        .then((res) => {
          this.detail = res.data.data
          this._versions(id)
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    _versions(id) {
      this.versionsLoading = true
      $ApiService.tariffBaseService
        ._versions({ id })
        .then((res) => {
          this.versions = res.data.data
        })
        .finally(() => {
          this.versionsLoading = false
        })
    },
    _version(id, versionId) {
      this.versionsLoading = true
      $ApiService.tariffBaseService
        ._version({ id, versionId })
        .then((res) => {
          this.viewVersion = res.data.data
        })
        .finally(() => {
          this.versionsLoading = false
        })
    },
    _store() {
      if (!this.payload.name || !this.payload.name.trim()) {
        $Toast.warning(t('tariffBase.form.name'))
        return
      }
      if (!this.payload.effective_date) {
        $Toast.warning(t('tariffBase.form.effectiveDate'))
        return
      }
      this.saveLoading = true
      const data = {
        name: this.payload.name.trim(),
        note: this.payload.note || undefined,
        base_amount: Number(this.payload.base_amount),
        min_floor: this.payload.min_floor ? Number(this.payload.min_floor) : undefined,
        effective_date: this.payload.effective_date
      }
      $ApiService.tariffBaseService
        ._store({ data })
        .then(() => {
          this.formVisible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update() {
      this.saveLoading = true
      const data = {
        name: this.payload.name,
        note: this.payload.note,
        active: this.payload.active
      }
      $ApiService.tariffBaseService
        ._update({ id: this.elementId, data })
        .then(() => {
          this.formVisible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete(id) {
      $ApiService.tariffBaseService
        ._delete({ id })
        .then((res) => {
          $Toast.success(res?.data?.message ?? t('content.delete'))
          this._index()
        })
        .catch((e) => {
          $Toast.error(e?.response?.data?.message ?? t('content.error'))
        })
    },
    _confirmVersion(versionId) {
      this.versionsLoading = true
      $ApiService.tariffBaseService
        ._confirmVersion({ id: this.elementId, versionId })
        .then(() => {
          $Toast.success(t('tariffGrid.status.confirmed'))
          this._show(this.elementId)
        })
        .finally(() => {
          this.versionsLoading = false
        })
    },
    _storeVersion() {
      if (!this.versionPayload.effective_date) {
        $Toast.warning(t('tariffBase.form.effectiveDate'))
        return
      }
      this.versionSaveLoading = true
      const data = {
        base_amount: Number(this.versionPayload.base_amount),
        min_floor: this.versionPayload.min_floor ? Number(this.versionPayload.min_floor) : undefined,
        effective_date: this.versionPayload.effective_date,
        note: this.versionPayload.note || undefined
      }
      $ApiService.tariffBaseService
        ._storeVersion({ id: this.elementId, data })
        .then(() => {
          this.detailEditing = false
          this.viewMode = 'history'
          this._show(this.elementId)
        })
        .finally(() => {
          this.versionSaveLoading = false
        })
    },

    // --- Modal / forma ochish ---
    openView(id) {
      this.viewMode = 'view'
      this.viewVisible = true
      this._show(id)
    },
    openHistory(id) {
      this.viewMode = 'history'
      this.viewVisible = true
      this._show(id)
    },
    startCreate() {
      this.formType = true
      this.elementId = null
      this.payload = emptyPayload()
      this.formVisible = true
    },
    startEditMeta(row) {
      this.formType = false
      this.elementId = row.id
      this.payload = { name: row.name, note: row.note, active: row.active }
      this.formVisible = true
    },
    // Baza qiymatini o'zgartirish (yangi versiya — pending).
    startValueEdit() {
      const v = this.detail?.version
      this.viewVersion = null
      this.versionPayload = {
        base_amount: v ? v.base_amount : null,
        min_floor: v ? v.min_floor : null,
        effective_date: null,
        note: null
      }
      this.detailEditing = true
    },
    cancelValueEdit() {
      this.detailEditing = false
    }
  }
})
