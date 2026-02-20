import { defineStore } from 'pinia'
import Utils from '@/utils/Utils.js'

const makeTranslations = () => [
  { label: "O'zbek", locale: 'uz', title: '', short_description: '', content: '' },
  { label: 'Русский', locale: 'ru', title: '', short_description: '', content: '' },
  { label: 'English', locale: 'en', title: '', short_description: '', content: '' }
]

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
    }
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
        this.fillPayload()
        return true
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
      return false
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
        media: (inst.media || []).map((i) => ({
          ...i,
          name: i.path.slice(i.path.split('').findLastIndex((i) => i === '/') + 1)
        })),
        published_at: inst.published_at ? new Date(inst.published_at).getTime() : Date.now(),
        status: inst.status ?? 0,
        is_pinned: inst.is_pinned ?? false
      }
    },
    async _create() {
      try {
        this.saveLoading = true
        const fd = new FormData()
        fd.append('slug', this.payload.slug)
        fd.append('published_at', Utils.timeHHMMWithMonth(this.payload.published_at))
        fd.append('status', this.payload.status)
        fd.append('is_pinned', this.payload.is_pinned ? 1 : 0)
        this.payload.categories.forEach((id, i) => fd.append(`categories[${i}]`, id))
        this.payload.translations.forEach((t, i) => {
          if (t.title) fd.append(`translations[${i}][locale]`, t.locale)
          if (t.title) fd.append(`translations[${i}][title]`, t.title)
          if (t.short_description)
            fd.append(`translations[${i}][short_description]`, t.short_description)
          if (t.content) fd.append(`translations[${i}][content]`, t.content)
        })
        this.payload.media.forEach((item, i) => {
          const file = item.file ?? item
          const isVideo = (file.type ?? '').startsWith('video/')
          fd.append(`media[${i}][type]`, isVideo ? 'video' : 'image')
          fd.append(`media[${i}][order]`, i)
          fd.append(`media[${i}][file]`, file)
        })
        const res = await $ApiService.newsService._create({ data: fd })
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

        const fd = new FormData()
        fd.append('_method', 'PUT')

        if (this.payload.slug !== inst.slug)
          fd.append('slug', this.payload.slug)

        const fmtPayloadDate = Utils.timeHHMMWithMonth(this.payload.published_at)
        const fmtInstDate = Utils.timeHHMMWithMonth(new Date(inst.published_at).getTime())
        if (fmtPayloadDate !== fmtInstDate)
          fd.append('published_at', fmtPayloadDate)

        if (this.payload.status !== inst.status)
          fd.append('status', this.payload.status)

        if (this.payload.is_pinned !== inst.is_pinned)
          fd.append('is_pinned', this.payload.is_pinned ? 1 : 0)

        const origCatIds = (inst.categories ?? []).map((c) => c.id).sort().join(',')
        const newCatIds = [...this.payload.categories].sort().join(',')
        if (newCatIds !== origCatIds)
          this.payload.categories.forEach((id, i) => fd.append(`categories[${i}]`, id))
        
        
        if ([...fd.keys()].length > 1)
          promises.push($ApiService.newsService._update({ id: this.instance.id, data: fd }))

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
                  chat_news_id: this.instance.id,
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

        this.payload.media.forEach((file, i) => {
          if (!originalIds.has(file.id)) {
            const fd = new FormData()
            const f = file.file ?? file
            const isVideo = (f.type ?? '').startsWith('video/')
            fd.append('chat_news_id', this.instance.id)
            fd.append('type', isVideo ? 'video' : 'image')
            fd.append('order', i)
            fd.append('file', f)
            promises.push($ApiService.newsService._create_media({ data: fd }))
          }
        })

        await Promise.all(promises)
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
      return $ApiService.newsService._delete({ id: this.instance.id }).finally(() => {
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
    }
  }
})
