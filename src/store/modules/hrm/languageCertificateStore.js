import { defineStore } from 'pinia'

// Xodimning til sertifikatlari (IELTS, HSK, DELF...).
// `languageStore` (xodim qaysi tillarni biladi) dan ALOHIDA — bu rasmiy hujjat:
// turi, CEFR darajasi, ball, raqam, muddat.
export const useLanguageCertificateStore = defineStore('languageCertificateStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true,
    elementId: null,

    // Select manbalari
    typeList: [], // [{id, name, language_ids, measures}]
    typeLoading: false,
    cefrList: [], // [{id, name}]

    payload: {
      language_id: null,
      certificate_type: null,
      cefr_level: null,
      score: null,
      certificate_number: null,
      issue_date: null,
      expiry_date: null,
      file: null
    },
    params: {
      page: 1,
      per_page: 10
    },
    uuid: null
  }),
  getters: {
    // Tanlangan tilga mos sertifikat turlari. Har turda `language_ids` bor —
    // odatda bitta til, Milliy sertifikatda esa qaror qamragan barcha tillar
    // (`O'zbek/Tojik/Qozoq/Turkman` KIRMAYDI, ular qarorda yo'q).
    filteredTypeList(state) {
      if (!state.payload.language_id) return state.typeList
      return state.typeList.filter((v) =>
        (v.language_ids ?? []).includes(state.payload.language_id)
      )
    },
    // Tanlangan tur (barcha quyidagi getterlar shunga tayanadi).
    selectedType(state) {
      return state.typeList.find((v) => v.id === state.payload.certificate_type) ?? null
    },
    // Malaka sertifikatlari (CELTA, TKT...) til darajasini bermaydi — CEFR o'chadi.
    isQualification() {
      return this.selectedType?.measures === 'qualification'
    },
    // Til + tur tanlangunga qadar qolgan maydonlar ko'rinmaydi.
    showDetails(state) {
      return Boolean(state.payload.language_id && state.payload.certificate_type)
    },
    // 3318 2-ilova: shu sertifikat bera oladigan darajalar. Masalan DSD I faqat
    // B1, TOPIK I faqat A1–A2, DALF faqat C1–C2 — qolganlari tanlanmaydi.
    allowedCefrList(state) {
      const levels = this.selectedType?.levels
      if (!levels?.length) return state.cefrList
      return state.cefrList.filter((v) => levels.includes(v.name))
    },
    // Ball faqat `numeric` turlarda so'raladi (IELTS 4.0-5.0, TOEIC 790-1090,
    // Test DAF TDN 3/4). `label` turlarda natija darajadan kelib chiqadi
    // (HSK4, N2, ТРКИ 2), `none` turlarda ball tushunchasi yo'q (Milliy, DELE).
    showScore() {
      return this.selectedType?.scoring === 'numeric'
    }
  },
  actions: {
    _index() {
      this.loading = true
      $ApiService.languageCertificateService
        ._index({ params: { uuid: this.uuid } })
        .then((res) => {
          this.list = res.data.data
        })
        .finally(() => {
          this.loading = false
        })
    },
    // Turlar + CEFR bir marta yuklanadi (ro'yxat o'zgarmaydi).
    _enums() {
      if (this.typeList.length > 0) return
      this.typeLoading = true
      Promise.all([
        $ApiService.languageCertificateService._types(),
        $ApiService.languageCertificateService._cefrLevels()
      ])
        .then(([types, cefr]) => {
          this.typeList = types.data.data
          this.cefrList = cefr.data.data
        })
        .finally(() => {
          this.typeLoading = false
        })
    },
    _create(data) {
      this.saveLoading = true
      $ApiService.languageCertificateService
        ._create({ data })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _update(data) {
      this.saveLoading = true
      const params = { _method: 'PUT' }
      $ApiService.languageCertificateService
        ._update({ data, id: this.elementId, params })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.languageCertificateService
        ._delete({ id: this.elementId })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    openVisible(data) {
      this.visible = data
    },
    // Til o'zgarganda sertifikat turi mos kelmay qolishi mumkin — tozalanadi.
    onLanguageChange() {
      const t = this.typeList.find((v) => v.id === this.payload.certificate_type)
      if (t && !(t.language_ids ?? []).includes(this.payload.language_id)) {
        this.payload.certificate_type = null
      }
    },
    resetForm() {
      this.elementId = null
      this.payload.language_id = null
      this.payload.certificate_type = null
      this.payload.cefr_level = null
      this.payload.score = null
      this.payload.certificate_number = null
      this.payload.issue_date = null
      this.payload.expiry_date = null
      this.payload.file = null
    }
  }
})
