import { defineStore } from 'pinia'

export const useUploadSourceConfigStore = defineStore('uploadSourceConfig', {
  state: () => ({
    tree: [],
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    // Tanlangan korxonalar (to'liq ob'ekt — o'ng panel uchun)
    selectedOrgs: [],
    // Tanlangan korxona IDlari (tez tekshiruv uchun)
    selectedIds: [],
    // Kengaytirilgan tugunlar IDlari
    expandedIds: [],
    // Joriy config shakli
    allowedSource: 3,
    // Qidiruv
    orgSearch: ''
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.uploadSourceConfigService
        ._index()
        .then((res) => {
          this.tree = res.data.data || []
          this.expandedIds = this.tree.map((n) => n.id)
          this.selectedOrgs = []
          this.selectedIds = []
        })
        .finally(() => {
          this.loading = false
        })
    },

    // Tanlangan barcha korxonalar uchun aynan bir xil allowed_source saqlash
    async _upsert() {
      if (!this.selectedOrgs.length) return
      this.saveLoading = true
      try {
        // Har bir tanlangan korxona uchun alohida so'rov (group tugunlar o'tkazib yuboriladi)
        const leaf = this.selectedOrgs.filter((o) => !o.group)
        await Promise.all(
          leaf.map((org) =>
            $ApiService.uploadSourceConfigService._upsert({
              organization_id: org.id,
              allowed_source: this.allowedSource,
              include_children: false
            })
          )
        )
        $Toast.success('Saqlandi')
        this._index()
      } finally {
        this.saveLoading = false
      }
    },

    async _delete() {
      const leaf = this.selectedOrgs.filter((o) => !o.group)
      if (!leaf.length) return
      this.deleteLoading = true
      try {
        await Promise.all(
          leaf.map((org) => $ApiService.uploadSourceConfigService._delete(org.id))
        )
        $Toast.success("Default holatga qaytarildi")
        this.allowedSource = 3
        this._index()
      } finally {
        this.deleteLoading = false
      }
    }
  }
})
