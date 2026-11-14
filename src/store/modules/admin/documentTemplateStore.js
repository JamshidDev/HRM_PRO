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
    // null | 'unsupported' (server eski) | 'unsigned' (OnlyOffice siri yo'q) | 'failed' | 'unreachable'
    configError: null,

    // Tahrir holati: 'idle' | 'dirty' (o'zgarish bor) | 'saved' | 'rejected'
    saveState: 'idle',
    // «Saqlash» bosildi — OnlyOffice natijasi kelguncha tugma band.
    saving: false,
    discarding: false,
    savedAt: null,
    rejectMessage: null,

    variables: [],

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

    // OnlyOffice hujjat kaliti — saqlash natijalari faqat shu sessiya bo'yicha olinadi.
    docKey: (state) => state.editorConfig?.document?.key ?? null,

    selected: (state) =>
      state.list.find((r) => `${r.category}:${r.type}` === state.selectedKey) ?? null

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
      this._resetSaveState()
      if (!key) return
      await Promise.all([this._loadEditor(), this._loadVariables()])
      await this._syncLastSave()
    },

    async _loadEditor() {
      const sel = this.selected
      if (!sel) return
      const key = this.selectedKey
      this.configLoading = true
      this.configError = null
      try {
        const res = await $ApiService.documentTemplateService._editorConfig({
          params: { category: sel.category, type: sel.type }
        })
        // Shablon almashib ketgan bo'lsa — eskirgan javob tashlanadi.
        if (key !== this.selectedKey) return
        const data = res.data.data
        this.editorConfig = data?.config ?? null
        this.canEdit = Boolean(data?.can_edit)
        // Imzosiz sozlamani OnlyOffice rad etadi — tushunarli xabar ko'rsatiladi.
        if (!this.editorConfig?.token) this.configError = 'unsigned'
      } catch (e) {
        if (key !== this.selectedKey) return
        this.editorConfig = null
        this.configError = e?.response?.status === 404 ? 'unsupported' : 'failed'
      } finally {
        if (key === this.selectedKey) this.configLoading = false
      }
    },

    // Faqat tanlangan shablonning o'zgaruvchilari — almashgandan keyin kelgan eski javob tashlanadi.
    async _loadVariables() {
      const sel = this.selected
      if (!sel) return
      const key = this.selectedKey
      try {
        const res = await $ApiService.documentTemplateService._variables({
          params: { category: sel.category, type: sel.type }
        })
        if (key === this.selectedKey) this.variables = res.data.data?.variables ?? []
      } catch {
        if (key === this.selectedKey) this.variables = []
      }
    },

    // Joriy oxirgi natija id'si — eski natijalar qayta xabar bo'lib chiqmasin.
    async _syncLastSave() {
      const row = await this._fetchLastSave()
      this.lastSaveId = row?.id ?? 0
    },

    async _fetchLastSave(afterId) {
      const sel = this.selected
      if (!sel || !this.docKey) return null
      try {
        const res = await $ApiService.documentTemplateService._lastSave({
          params: {
            category: sel.category,
            type: sel.type,
            key: this.docKey,
            after_id: afterId || undefined
          }
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
      this.saving = false
      if (row.status === 'saved') {
        this.saveState = 'saved'
        this.savedAt = row.created_at
        this.rejectMessage = null
        await Promise.all([this._index(), this._loadVariables()])
      } else {
        this.saveState = 'rejected'
        this.rejectMessage = row.message
      }
      return row
    },

    // «Saqlash» tugmasi: true — saqlash boshlandi, false — o'zgarish yo'q yoki xato.
    async _forceSave() {
      const sel = this.selected
      if (!sel || !this.docKey || this.saving) return false
      this.saving = true
      try {
        const res = await $ApiService.documentTemplateService._forceSave({
          data: { category: sel.category, type: sel.type, key: this.docKey }
        })
        if (res.data.data?.status === 'no_changes') {
          this.saving = false
          $Toast.info(t('documentTemplate.noChanges'))
          return false
        }
        // Natija kelmasa tugma abadiy band qolmasin.
        window.setTimeout(() => (this.saving = false), 30000)
        return true
      } catch {
        this.saving = false
        return false
      }
    },

    // Saqlanmagan tahrirni tashlab, oxirgi saqlangan nusxani yangi sessiyada ochadi.
    async _discard() {
      const sel = this.selected
      if (!sel || !this.docKey) return false
      this.discarding = true
      try {
        await $ApiService.documentTemplateService._discard({
          data: { category: sel.category, type: sel.type, key: this.docKey }
        })
        this._resetSaveState()
        await this._loadEditor()
        await this._syncLastSave()
        return true
      } catch {
        return false
      } finally {
        this.discarding = false
      }
    },

    // OnlyOffice: hujjatda saqlanmagan o'zgarish paydo bo'ldi.
    _markDirty() {
      if (this.canEdit) this.saveState = 'dirty'
    },

    _resetSaveState() {
      this.saveState = 'idle'
      this.saving = false
      this.savedAt = null
      this.rejectMessage = null
      this.lastSaveId = 0
    }

  }
})
