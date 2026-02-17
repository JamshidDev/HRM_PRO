import { defineStore } from 'pinia'

const makeTranslations = () => [
  { label: "O'zbek", locale: 'uz', title: '', short_description: '', content: '' },
  { label: 'Русский', locale: 'ru', title: '', short_description: '', content: '' },
  { label: 'English', locale: 'en', title: '', short_description: '', content: '' }
]

const buildFormData = (payload) => {
  const fd = new FormData()

  fd.append('slug', payload.slug)
  fd.append('published_at', payload.published_at)
  fd.append('status', payload.status)
  fd.append('is_pinned', payload.is_pinned ? 1 : 0)

  payload.categories.forEach((id, i) => fd.append(`categories[${i}]`, id))

  payload.translations.forEach((t, i) => {
    fd.append(`translations[${i}][locale]`, t.locale)
    fd.append(`translations[${i}][title]`, t.title)
    fd.append(`translations[${i}][short_description]`, t.short_description)
    fd.append(`translations[${i}][content]`, t.content)
  })

  payload.media.forEach((item, i) => {
    const file = item.file ?? item
    const isVideo = (file.type ?? '').startsWith('video/')
    fd.append(`media[${i}][type]`, isVideo ? 'video' : 'image')
    fd.append(`media[${i}][order]`, i)
    fd.append(`media[${i}][file]`, file)
  })

  return fd
}

export const useNewsStore = defineStore('newsStore', {
  state: () => ({
    list: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    params: {
      page: 1,
      per_page: 10,
      search: null,
      status: null
    },
    totalItems: 0,
    instance: null,
    payload: {
      slug: '',
      translations: makeTranslations(),
      categories: [],
      media: [],
      published_at: Date.now(),
      status: 0,
      is_pinned: false
    },
    elementId: null
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.newsService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    async _show(id) {
      this.loading = true
      try {
        const res = await $ApiService.newsService._show({ id })
        this.instance = res.data.data
        this.elementId = id
        this.fillPayload()
        return res
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    fillPayload() {
      if (!this.instance) return
      const inst = this.instance
      this.payload = {
        slug: inst.slug ?? '',
        translations: makeTranslations().map((t) => {
          const found = inst.translations?.find((r) => r.locale === t.locale) ?? {}
          return {
            ...t,
            title: found.title ?? '',
            short_description: found.short_description ?? '',
            content: found.content ?? ''
          }
        }),
        categories: inst.categories?.map((c) => c.id) ?? [],
        media: inst.media ?? [],
        published_at: inst.published_at ? new Date(inst.published_at).getTime() : Date.now(),
        status: inst.status ?? 0,
        is_pinned: inst.is_pinned ?? false
      }
    },
    async _create() {
      try {
        this.saveLoading = true
        const res = await $ApiService.newsService._create({ data: buildFormData(this.payload) })
        this._index()
        return res
      } catch (error) {
        console.error(error)
      } finally {
        this.saveLoading = false
      }
      return false
    },
    async _update() {
      if (!this.instance) return false
      try {
        this.saveLoading = true
        const inst = this.instance
        const promises = []

        // Diff translations → update changed ones
        for (const t of this.payload.translations) {
          const original = inst.translations?.find((r) => r.locale === t.locale) ?? {}
          const changed =
            t.title !== (original.title ?? '') ||
            t.short_description !== (original.short_description ?? '') ||
            t.content !== (original.content ?? '')
          if (changed) {
            promises.push(
              $ApiService.newsService._update_translation({
                data: {
                  news_id: this.elementId,
                  locale: t.locale,
                  title: t.title,
                  short_description: t.short_description,
                  content: t.content
                }
              })
            )
          }
        }

        // Diff media → remove deleted, add new
        const originalIds = new Set((inst.media ?? []).map((m) => m.id))
        const currentIds = new Set(this.payload.media.filter((m) => m.id).map((m) => m.id))

        for (const id of originalIds) {
          if (!currentIds.has(id)) {
            promises.push($ApiService.newsService._remove_media({ id }))
          }
        }

        for (const file of this.payload.media) {
          if (!file.id) {
            promises.push($ApiService.newsService._create_media({ data: { news_id: this.elementId, file } }))
          }
        }

        await Promise.all(promises)
        this._index()
        return true
      } catch (error) {
        console.error(error)
      } finally {
        this.saveLoading = false
      }
      return false
    },
    _delete() {
      this.deleteLoading = true
      $ApiService.newsService
        ._delete({ id: this.elementId })
        .then(() => {
          this._index()
        })
        .finally(() => {
          this.deleteLoading = false
        })
    },
    resetForm() {
      this.payload = {
        slug: '',
        translations: makeTranslations(),
        categories: [],
        media: [],
        published_at: Date.now(),
        status: 0,
        is_pinned: false
      }
      this.instance = null
      this.elementId = null
    }
  }
})
