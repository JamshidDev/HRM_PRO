import { defineStore } from 'pinia'
import router from '@/router/index.js'
import { AppPaths, compressImageFile, MAX_UPLOAD_SIZE } from '@/utils/index.js'
import Utils from '@/utils/Utils.js'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

const makeLang = () => ({ uz: null, ru: null, en: null })

// {uz,ru,en} -> faqat to'ldirilganlar; hech biri bo'lmasa null (backend jsonb).
const cleanLang = (obj) => {
  const out = {}
  if (obj?.uz) out.uz = obj.uz
  if (obj?.ru) out.ru = obj.ru
  if (obj?.en) out.en = obj.en
  return Object.keys(out).length ? out : null
}

const emptyPayload = () => ({
  title: makeLang(),
  subtitle: makeLang(),
  action_type: null,
  status: 2, // 1=qoralama, 2=chop etilgan
  published_at: null,
  sort: 1
})

export const useMobileStoryStore = defineStore('mobileStory', {
  state: () => ({
    // ── ro'yxat ──
    list: [],
    loading: false,
    deleteLoading: false,
    elementId: null,
    totalItems: 0,
    params: { page: 1, per_page: 10, search: null },

    // ── detail/form sahifa ──
    detailLoading: false,
    saveLoading: false,
    payload: emptyPayload(),
    slides: [], // {id, media_type, url, sort}
    viewsCount: 0,
    slideUploading: false,
    slideDeletingId: null
  }),
  actions: {
    // ── LIST ──
    _index() {
      this.loading = true
      $ApiService.mobileStoryService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },

    _delete(id) {
      this.deleteLoading = true
      this.elementId = id
      $ApiService.mobileStoryService
        ._delete({ id })
        .then(() => this._index())
        .finally(() => {
          this.deleteLoading = false
        })
    },

    // Detail sahifadan o'chirish (ro'yxatni yangilamaydi — sahifa orqaga qaytadi).
    _deleteStory(id) {
      this.deleteLoading = true
      return $ApiService.mobileStoryService
        ._delete({ id })
        .finally(() => {
          this.deleteLoading = false
        })
    },

    // ── FORM (create + edit) ──
    resetForm() {
      this.elementId = null
      this.payload = emptyPayload()
      this.slides = []
      this.viewsCount = 0
    },

    // Edit rejimi: story + slaydlarni (preview URL bilan) yuklaydi.
    _show(id) {
      this.detailLoading = true
      return $ApiService.mobileStoryService
        ._show({ id })
        .then((res) => {
          const d = res.data.data
          this.elementId = d.id
          this.payload = {
            title: { uz: d.title?.uz ?? null, ru: d.title?.ru ?? null, en: d.title?.en ?? null },
            subtitle: {
              uz: d.subtitle?.uz ?? null,
              ru: d.subtitle?.ru ?? null,
              en: d.subtitle?.en ?? null
            },
            action_type: d.action_type,
            status: d.status,
            published_at: d.published_at,
            sort: d.sort
          }
          this.viewsCount = d.views_count ?? 0
          this.slides = (d.slides ?? []).map((s) => ({
            id: s.id,
            media_type: s.media_type,
            url: s.url,
            sort: s.sort
          }))
        })
        .finally(() => {
          this.detailLoading = false
        })
    },

    _buildData() {
      return {
        title: cleanLang(this.payload.title),
        subtitle: cleanLang(this.payload.subtitle),
        action_type: this.payload.action_type || undefined,
        status: this.payload.status,
        published_at: this.payload.published_at || undefined,
        sort: this.payload.sort ?? 1
      }
    },

    // Yangi story yaratiladi → detail sahifaga (o'sha id) o'tadi, u yerда slayd qo'shiladi.
    _create() {
      this.saveLoading = true
      return $ApiService.mobileStoryService
        ._create({ data: this._buildData() })
        .then((res) => {
          const id = res.data.data.id
          this.elementId = id
          router.replace(Utils.routeChatPathMaker(`${AppPaths.MobileStories}/${id}`))
        })
        .finally(() => {
          this.saveLoading = false
        })
    },

    // Mavjud story maydonlarini saqlash.
    _update() {
      this.saveLoading = true
      return $ApiService.mobileStoryService
        ._update({ id: this.elementId, data: this._buildData() })
        .finally(() => {
          this.saveLoading = false
        })
    },

    // Rasm siqiladi (video tegilmaydi); limitdan katta bo'lsa null — yuborilmaydi.
    async _prepareSlideFile(file) {
      const prepared = await compressImageFile(file)
      if (prepared.size > MAX_UPLOAD_SIZE) {
        window.$Toast?.error(t('mobileStoryPage.form.fileTooLarge'))
        return null
      }
      return prepared
    },

    // Slayd qo'shish — darhol yuklanadi, natija (preview URL bilan) ro'yxatga qo'shiladi.
    async _addSlide(file) {
      this.slideUploading = true
      try {
        const mediaType = (file.type ?? '').startsWith('video/') ? 'video' : 'image'
        const prepared = await this._prepareSlideFile(file)
        if (!prepared) return

        const fd = new FormData()
        fd.append('file', prepared)
        fd.append('media_type', mediaType)
        fd.append('sort', this.slides.length + 1)
        const res = await $ApiService.mobileStoryService._createSlide({ id: this.elementId, data: fd })
        const s = res.data.data
        this.slides.push({ id: s.id, media_type: s.media_type, url: s.url, sort: s.sort })
      } finally {
        this.slideUploading = false
      }
    },

    // Slayd media'sini almashtirish — darhol; ro'yxatdagi slaydni yangilaydi (id saqlanadi).
    async _replaceSlide(slideId, file) {
      this.slideUploading = true
      try {
        const mediaType = (file.type ?? '').startsWith('video/') ? 'video' : 'image'
        const prepared = await this._prepareSlideFile(file)
        if (!prepared) return

        const fd = new FormData()
        fd.append('file', prepared)
        fd.append('media_type', mediaType)
        const res = await $ApiService.mobileStoryService._replaceSlide({ slideId, data: fd })
        const s = res.data.data
        const idx = this.slides.findIndex((x) => x.id === slideId)
        if (idx !== -1) {
          this.slides[idx] = { id: s.id, media_type: s.media_type, url: s.url, sort: s.sort }
        }
      } finally {
        this.slideUploading = false
      }
    },

    // Slayd o'chirish — darhol.
    _deleteSlide(slideId) {
      this.slideDeletingId = slideId
      return $ApiService.mobileStoryService
        ._removeSlide({ id: slideId })
        .then(() => {
          this.slides = this.slides.filter((s) => s.id !== slideId)
        })
        .finally(() => {
          this.slideDeletingId = null
        })
    }
  }
})
