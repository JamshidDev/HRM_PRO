import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

/**
 * Tahrirlash v2 — docx-editor.dev (brauzer ichida DOCX tahriri).
 *
 * OnlyOffice store'idan (`onlyOfficeStore`) farqi: bu yerda tashqi Document Server
 * yo'q — DOCX baytlari AUTH bilan backend'dan olinadi (`/v1/document/editor/content`)
 * va AUTH bilan qaytariladi (`/v1/document/editor/save`). Ikkalasi bir xil faylga
 * yozadi, shuning uchun hujjatni ikkala muharrirda navbat bilan ochish mumkin.
 *
 * `version` — optimistik qulf tokeni (backend'dagi `updated_at`). Boshqa birov
 * (yoki OnlyOffice) o'zgartirgan bo'lsa backend saqlashni rad etadi.
 */
export const useDocxEditorStore = defineStore('docxEditorStore', {
  state: () => ({
    visible: false,
    model: null,
    documentId: null,

    // Muharrirga beriladigan DOCX baytlari (Uint8Array).
    bytes: null,
    fileName: null,
    version: null,

    // `/v1/document/show` javobi — tasdiqlovchilar paneli uchun.
    document: null,

    loading: false,
    saving: false,
    // Muharrirda o'zgarish bo'ldimi (saqlanmagan tahrir bormi).
    dirty: false
  }),

  getters: {
    confirmations: (state) => state.document?.confirmations ?? [],
    // Joriy foydalanuvchi imzolashi kerakmi (document/show `signature.signature`).
    canSign: (state) => Boolean(state.document?.signature?.signature)
  },

  actions: {
    async _open(documentId, model) {
      this.model = model
      this.documentId = documentId
      this.bytes = null
      this.document = null
      this.version = null
      this.fileName = null
      this.dirty = false
      this.visible = true
      await Promise.all([this._loadContent(), this._loadDocument()])
    },

    // Muharrir uchun DOCX baytlari + versiya tokeni.
    async _loadContent() {
      this.loading = true
      try {
        const res = await $ApiService.documentService._editorContent({
          params: { model: this.model, document_id: this.documentId }
        })
        // markRaw — typed array Vue proxy'siga o'ralib qolmasin (muharrir xom
        // baytlar ustida ishlaydi).
        this.bytes = markRaw(new Uint8Array(res.data))
        this.version = res.headers?.['x-document-version'] ?? null
        // DOCX nomi header'dan — `document/show` dagi nom PDF'niki (`{uuid}.pdf`).
        this.fileName = res.headers?.['x-document-filename'] ?? this.fileName
        this.dirty = false
      } catch (e) {
        // Xato javobi ham arraybuffer — JSON'ni dekod qilib xabarni ko'rsatamiz.
        this.visible = false
        $Toast.error(this._errorMessage(e))
      } finally {
        this.loading = false
      }
    },

    // Tasdiqlovchilar + hujjat sarlavhasi (mavjud `/document/show` qayta ishlatiladi).
    async _loadDocument() {
      try {
        const res = await $ApiService.documentService._openDocument({
          params: { model: this.model, document_id: this.documentId }
        })
        this.document = res.data.data
        // Zaxira nom — `content` javobi header'i (DOCX nomi) kelmasa ishlatiladi.
        this.fileName = this.fileName ?? this.document?.document?.file_name ?? null
      } catch {
        // Panel ma'lumoti ikkilamchi — muharrir baribir ochiladi.
        this.document = null
      }
    },

    /**
     * Muharrir bergan ArrayBuffer'ni saqlaydi. Muvaffaqiyatda yangi `version`
     * olinadi — muharrirni yopmasdan qayta-qayta saqlash uchun.
     */
    async _save(buffer) {
      if (!buffer) return false
      this.saving = true
      try {
        const form = new FormData()
        form.append(
          'file',
          new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }),
          this.fileName ?? 'document.docx'
        )
        form.append('model', this.model)
        form.append('document_id', String(this.documentId))
        if (this.version) form.append('version', this.version)

        const res = await $ApiService.documentService._editorSave({ data: form })
        this.version = res.data?.data?.version ?? this.version
        this.dirty = false
        $Toast.success(t('docxEditor.saved'))
        return true
      } catch {
        // Xabarni axios interceptor ko'rsatadi (409 konflikt, imzo bor va h.k.).
        return false
      } finally {
        this.saving = false
      }
    },

    // Yopilish animatsiyasini boshlaydi (holat saqlanib turadi — hujjat oyna
    // pastga tushayotganda ekranda qoladi).
    _hide() {
      this.visible = false
    },

    // Animatsiya tugagach chaqiriladi (drawer `after-leave`).
    _close() {
      this.visible = false
      this.bytes = null
      this.document = null
      this.dirty = false
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
