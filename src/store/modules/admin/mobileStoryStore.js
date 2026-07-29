import { defineStore } from 'pinia'

const makeLang = () => ({ uz: null, ru: null, en: null })

// {uz,ru,en} -> faqat to'ldirilganlar; hech biri bo'lmasa null (backend jsonb).
const cleanLang = (obj) => {
  const out = {}
  if (obj?.uz) out.uz = obj.uz
  if (obj?.ru) out.ru = obj.ru
  if (obj?.en) out.en = obj.en
  return Object.keys(out).length ? out : null
}

export const useMobileStoryStore = defineStore('mobileStory', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    visible: false,
    visibleType: true, // true = create
    elementId: null,
    totalItems: 0,
    payload: {
      title: makeLang(),
      subtitle: makeLang(),
      action_type: null,
      status: 2, // 1=qoralama, 2=chop etilgan
      published_at: null,
      sort: 1,
      // Mavjud slayd: {id, media_type, existing:true}; yangi (UIUpload): {id(uuid), name, file}
      slides: []
    },
    removedSlideIds: [],
    params: { page: 1, per_page: 10, search: null }
  }),
  actions: {
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

    _show(id) {
      this.loading = true
      return $ApiService.mobileStoryService
        ._show({ id })
        .then((res) => {
          const d = res.data.data
          this.elementId = d.id
          this.payload.title = { uz: d.title?.uz ?? null, ru: d.title?.ru ?? null, en: d.title?.en ?? null }
          this.payload.subtitle = {
            uz: d.subtitle?.uz ?? null,
            ru: d.subtitle?.ru ?? null,
            en: d.subtitle?.en ?? null
          }
          this.payload.action_type = d.action_type
          this.payload.status = d.status
          this.payload.published_at = d.published_at
          this.payload.sort = d.sort
          this.payload.slides = (d.slides ?? []).map((s) => ({
            id: s.id,
            media_type: s.media_type,
            existing: true,
            name: `${s.media_type === 'video' ? 'Video' : 'Rasm'} #${s.id}`
          }))
          this.removedSlideIds = []
        })
        .finally(() => {
          this.loading = false
        })
    },

    // Yangi slaydlarni (item.file bor) ketma-ket yuklaydi.
    async _uploadNewSlides(storyId) {
      const newSlides = this.payload.slides.filter((s) => s.file)
      for (let i = 0; i < newSlides.length; i++) {
        const item = newSlides[i]
        const file = item.file
        const fd = new FormData()
        fd.append('file', file)
        fd.append('media_type', (file.type ?? '').startsWith('video/') ? 'video' : 'image')
        fd.append('sort', i + 1)
        await $ApiService.mobileStoryService._createSlide({ id: storyId, data: fd })
      }
    },

    async _create() {
      this.saveLoading = true
      try {
        const data = {
          title: cleanLang(this.payload.title),
          subtitle: cleanLang(this.payload.subtitle),
          action_type: this.payload.action_type || undefined,
          status: this.payload.status,
          published_at: this.payload.published_at || undefined,
          sort: this.payload.sort ?? 1
        }
        const res = await $ApiService.mobileStoryService._create({ data })
        const storyId = res.data.data.id
        await this._uploadNewSlides(storyId)
        this.visible = false
        this._index()
        return true
      } finally {
        this.saveLoading = false
      }
    },

    async _update() {
      this.saveLoading = true
      try {
        const data = {
          title: cleanLang(this.payload.title),
          subtitle: cleanLang(this.payload.subtitle),
          action_type: this.payload.action_type || undefined,
          status: this.payload.status,
          published_at: this.payload.published_at || undefined,
          sort: this.payload.sort ?? 1
        }
        await $ApiService.mobileStoryService._update({ id: this.elementId, data })
        // o'chirilgan mavjud slaydlar
        for (const slideId of this.removedSlideIds) {
          await $ApiService.mobileStoryService._removeSlide({ id: slideId })
        }
        // yangi slaydlar
        await this._uploadNewSlides(this.elementId)
        this.visible = false
        this._index()
        return true
      } finally {
        this.saveLoading = false
      }
    },

    _delete() {
      this.deleteLoading = true
      $ApiService.mobileStoryService
        ._delete({ id: this.elementId })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },

    // Formada slayd o'chirilganda: mavjud bo'lsa -> removedSlideIds, aks holda ro'yxatdan olib tashla.
    removeSlide(slide) {
      if (slide.existing) this.removedSlideIds.push(slide.id)
      this.payload.slides = this.payload.slides.filter((s) => s.id !== slide.id)
    },

    openVisible(data) {
      this.visible = data
    },

    resetForm() {
      this.elementId = null
      this.removedSlideIds = []
      this.payload.title = makeLang()
      this.payload.subtitle = makeLang()
      this.payload.action_type = null
      this.payload.status = 2
      this.payload.published_at = null
      this.payload.sort = 1
      this.payload.slides = []
    }
  }
})
