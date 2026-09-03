import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

/**
 * «Shablon» sahifasi — buyruq/shartnoma/qo'shimcha shartnoma/ariza DOCX
 * shablonlarini brauzerdagi muharrirda (docx-editor.dev) tahrirlash.
 *
 * `docxEditorStore` dan farqi: bu yerda hujjat NUSXASI emas, SHABLONNING O'ZI
 * tahrirlanadi va tahrir GLOBAL — hamma korxonaning yangi hujjatlariga tegadi.
 * Shuning uchun saqlashdan oldin tasdiq so'raladi va backend `${o'zgaruvchi}`
 * yo'qolgan shablonni rad etadi.
 *
 * `version` — optimistik qulf tokeni (backend `updated_at`). Boshqa admin
 * o'zgartirgan bo'lsa backend 409 beradi.
 */
export const useDocumentTemplateStore = defineStore('documentTemplateStore', {
  state: () => ({
    list: [],
    loading: false,

    // Tanlangan shablon: ro'yxatdagi qator (`category` + `type` kaliti bilan).
    selectedKey: null,

    // Muharrirga beriladigan DOCX baytlari (Uint8Array).
    bytes: null,
    fileName: null,
    version: null,
    variables: [],

    contentLoading: false,
    saving: false,
    resetting: false,
    // Muharrirda saqlanmagan o'zgarish bormi.
    dirty: false
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

    // Select o'zgardi — shablonni muharrirga yuklaymiz.
    async _select(key) {
      this.selectedKey = key
      this.bytes = null
      this.version = null
      this.variables = []
      this.dirty = false
      if (!key) return
      await Promise.all([this._loadContent(), this._loadVariables()])
    },

    async _loadContent() {
      const sel = this.selected
      if (!sel) return
      this.contentLoading = true
      try {
        const res = await $ApiService.documentTemplateService._content({
          params: { category: sel.category, type: sel.type }
        })
        // markRaw — typed array Vue proxy'siga o'ralib qolmasin (muharrir xom
        // baytlar ustida ishlaydi).
        this.bytes = markRaw(new Uint8Array(res.data))
        this.version = res.headers?.['x-template-version'] ?? null
        this.fileName = res.headers?.['x-template-filename'] ?? sel.file_name
        this.dirty = false
      } catch (e) {
        this.bytes = null
        $Toast.error(this._errorMessage(e))
      } finally {
        this.contentLoading = false
      }
    },

    // Shablondagi `${...}` o'zgaruvchilar — muharrir yonidagi chip panel.
    async _loadVariables() {
      const sel = this.selected
      if (!sel) return
      try {
        const res = await $ApiService.documentTemplateService._variables({
          params: { category: sel.category, type: sel.type }
        })
        this.variables = res.data.data?.variables ?? []
      } catch {
        // Panel ikkilamchi — muharrir baribir ochiladi.
        this.variables = []
      }
    },

    async _save(buffer) {
      const sel = this.selected
      if (!buffer || !sel) return false
      this.saving = true
      try {
        const form = new FormData()
        form.append(
          'file',
          new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }),
          this.fileName ?? `${sel.type}.docx`
        )
        form.append('category', sel.category)
        form.append('type', String(sel.type))
        if (this.version) form.append('version', this.version)

        const res = await $ApiService.documentTemplateService._save({ data: form })
        this.version = res.data?.data?.version ?? this.version
        this.variables = res.data?.data?.variables ?? this.variables
        this.dirty = false
        $Toast.success(t('documentTemplate.saved'))
        // `source`/`edited` o'zgardi — ro'yxatni yangilaymiz.
        await this._index()
        return true
      } catch {
        // Xabarni axios interceptor ko'rsatadi (409 konflikt, o'zgaruvchi
        // yo'qolgani va h.k.).
        return false
      } finally {
        this.saving = false
      }
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
    },

    // arraybuffer javobidagi `{message}` ni o'qish (interceptor buni qila olmaydi).
    _errorMessage(e) {
      const data = e?.response?.data
      if (data instanceof ArrayBuffer) {
        try {
          return JSON.parse(new TextDecoder().decode(data))?.message ?? e.message
        } catch {
          return e.message
        }
      }
      return data?.message ?? e?.message ?? t('content.error')
    }
  }
})
