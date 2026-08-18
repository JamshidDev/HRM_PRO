import { defineStore } from 'pinia'

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
    }
  }),
  actions: {
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
