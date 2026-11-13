import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

/**
 * «Shablon» sahifasi — DOCX shablonni OnlyOffice'da ko'rish va tahrirlash.
 * Saqlashni OnlyOffice backend'ga callback qiladi; natija `last-save` orqali kuzatiladi.
 */
export const useDocumentTemplateStore = defineStore('documentTemplateStore', {
  state: () => ({
    list: [],
    loading: false,

    // Tanlangan shablon: ro'yxatdagi qator (`category` + `type` kaliti bilan).
    selectedKey: null,

    // OnlyOffice sozlamasi (imzolangan) va tahrir huquqi.
    editorConfig: null,
    canEdit: false,
    configLoading: false,
    configError: false,

    variables: [],
    resetting: false,

    // Sahifa ochilgandan keyingi saqlash natijalari shu id dan keyin kuzatiladi.
    lastSaveId: 0
  }),

  getters: {
    // Selectga beriladigan variantlar — «Buyruq · 32 · nom (32.docx)».
    options: (state) =>
      state.list.map((r) => ({
        key: `${r.category}:${r.type}`,
        category: r.category,
        type: r.type,
        label: `${r.category_name} · ${r.type} · ${r.name}`,
        fileName: r.file_name,
        source: r.source,
        edited: r.edited
      })),

    selected: (state) =>
      state.list.find((r) => `${r.category}:${r.type}` === state.selectedKey) ?? null,

    // Global override bor — «standartga qaytarish» tugmasi shunda faol.
    canReset: (state) =>
      Boolean(state.list.find((r) => `${r.category}:${r.type}` === state.selectedKey)?.edited)
  },

  actions: {
    async _index() {
      this.loading = true
      try {
        const res = await $ApiService.documentTemplateService._index({})
        this.list = res.data.data ?? []
      } finally {
        this.loading = false
      }
    },

    // Select o'zgardi — OnlyOffice sozlamasi va o'zgaruvchilar yuklanadi.
    async _select(key) {
      this.selectedKey = key
      this.editorConfig = null
      this.variables = []
      if (!key) return
      await Promise.all([this._loadEditor(), this._loadVariables(), this._syncLastSave()])
    },

    async _loadEditor() {
      const sel = this.selected
      if (!sel) return
      this.configLoading = true
      this.configError = false
      try {
        const res = await $ApiService.documentTemplateService._editorConfig({
          params: { category: sel.category, type: sel.type }
        })
        const data = res.data.data
        this.editorConfig = data?.config ?? null
        this.canEdit = Boolean(data?.can_edit)
        // Imzosiz sozlamani OnlyOffice rad etadi — tushunarli xabar ko'rsatiladi.
        this.configError = !this.editorConfig?.token
      } catch {
        this.editorConfig = null
        this.configError = true
      } finally {
        this.configLoading = false
      }
    },

    async _loadVariables() {
      const sel = this.selected
      if (!sel) return
      try {
        const res = await $ApiService.documentTemplateService._variables({
          params: { category: sel.category, type: sel.type }
        })
        this.variables = res.data.data?.variables ?? []
      } catch {
        this.variables = []
      }
    },

    // Joriy oxirgi natija id'si — eski natijalar qayta xabar bo'lib chiqmasin.
    async _syncLastSave() {
      const row = await this._fetchLastSave()
      this.lastSaveId = row?.id ?? 0
    },

    async _fetchLastSave(afterId) {
      const sel = this.selected
      if (!sel) return null
      try {
        const res = await $ApiService.documentTemplateService._lastSave({
          params: { category: sel.category, type: sel.type, after_id: afterId || undefined }
        })
        return res.data.data ?? null
      } catch {
        return null
      }
    },

    // Yangi saqlash natijasi bo'lsa qaytaradi va ro'yxat/o'zgaruvchilarni yangilaydi.
    async _checkSave() {
      const row = await this._fetchLastSave(this.lastSaveId)
      if (!row || row.id <= this.lastSaveId) return null
      this.lastSaveId = row.id
      if (row.status === 'saved') {
        await Promise.all([this._index(), this._loadVariables()])
      }
      return row
    },

    // Global override'ni o'chirib, git'dagi standart shablonga qaytadi.
    async _reset() {
      const sel = this.selected
      if (!sel) return false
      this.resetting = true
      try {
        await $ApiService.documentTemplateService._reset({
          category: sel.category,
          type: sel.type
        })
        $Toast.success(t('documentTemplate.resetDone'))
        await this._index()
        await this._select(this.selectedKey)
        return true
      } catch {
        return false
      } finally {
        this.resetting = false
      }
    }
  }
})
