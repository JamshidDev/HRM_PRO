import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

// Detal modalidagi tab kalitlari — page.vue va store bitta manbadan oladi.
const DETAIL_TABS = {
  face: 'face',
  devices: 'devices'
}

export const useMobileUserStore = defineStore('mobileUser', {
  state: () => ({
    list: [],
    loading: false,
    detailLoading: false,
    totalItems: 0,
    detailVisible: false,
    detail: null,
    detailTabs: DETAIL_TABS,
    detailTab: DETAIL_TABS.face,
    params: {
      page: 1,
      per_page: 15,
      search: null
    },

    // «Mobil versiya» kartalari — android/ios hozirgi qatori.
    versions: [],
    versionsLoading: false,
    // Hozir tahrirlanayotgan platforma ('android'|'ios'|null) — bir vaqtda
    // faqat bitta karta inline-tahrir rejimida bo'ladi.
    editingPlatform: null,
    editLatest: '',
    editMin: '',
    versionSaving: false
  }),
  actions: {
    async _loadVersions() {
      this.versionsLoading = true
      try {
        const res = await $ApiService.mobileUserService._versions()
        this.versions = res.data.data ?? []
      } finally {
        this.versionsLoading = false
      }
    },

    // Tahrir joriy so'nggi va minimal versiya bilan oldindan to'ldiriladi (matn — `1.9.2` son emas).
    _startVersionEdit(platform) {
      const row = this.versions.find((v) => v.platform === platform)
      this.editingPlatform = platform
      this.editLatest = row?.latest_version ? String(row.latest_version) : ''
      this.editMin = row?.min_supported_version ? String(row.min_supported_version) : ''
    },

    _cancelVersionEdit() {
      this.editingPlatform = null
      this.editLatest = ''
      this.editMin = ''
    },

    // min < latest — ixtiyoriy yangilash, min = latest — majburiy; store_url joriy qatordan ko'chiriladi.
    async _saveVersion() {
      const latest = String(this.editLatest ?? '').trim()
      const min = String(this.editMin ?? '').trim()
      if (!this.editingPlatform || !latest || !min) return
      const current = this.versions.find((v) => v.platform === this.editingPlatform)
      this.versionSaving = true
      try {
        await $ApiService.mobileUserService._updateVersion({
          data: {
            platform: this.editingPlatform,
            latest_version: latest,
            min_supported_version: min,
            store_url: current?.store_url || undefined,
            download_url: current?.download_url || undefined
          }
        })
        $Toast.success(t('mobileUserPage.versionSaved'))
        this._cancelVersionEdit()
        await this._loadVersions()
        return true
      } catch {
        // Xabarni axios interceptor ko'rsatadi.
        return false
      } finally {
        this.versionSaving = false
      }
    },

    _index() {
      this.loading = true
      $ApiService.mobileUserService
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
      this.detailLoading = true
      this.detailVisible = true
      // Har ochilishda Face ID tabidan boshlanadi.
      this.detailTab = DETAIL_TABS.face
      this.detail = null
      $ApiService.mobileUserService
        ._show({ id })
        .then((res) => {
          this.detail = res.data.data
        })
        .finally(() => {
          this.detailLoading = false
        })
    },
    _filterEvent() {
      this.params.page = 1
      this._index()
    }
  }
})
