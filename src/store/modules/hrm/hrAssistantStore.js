import { defineStore } from 'pinia'

// HR yordamchisi doirasi: «Butun korxona» yoki «Qisman» (tanlangan bo'limlar).
export const useHrAssistantStore = defineStore('hrAssistantStore', {
  state: () => ({
    list: [],
    totalItems: 0,
    loading: false,
    saveLoading: false,
    visible: false,
    selected: null,
    payload: { whole: true, departments: [] },
    params: { page: 1, per_page: 15, search: null }
  }),
  actions: {
    _index() {
      this.loading = true
      $ApiService.hrAssistantService
        ._index({ params: this.params })
        .then((res) => {
          this.list = res.data.data.data
          this.totalItems = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    openEdit(row) {
      this.selected = row
      this.payload = {
        whole: row.whole !== false,
        departments: (row.departments ?? []).map((d) => d.id)
      }
      this.visible = true
    },
    _save() {
      this.saveLoading = true
      return $ApiService.hrAssistantService
        ._save({
          data: {
            user_id: this.selected.user_id,
            organization_id: this.selected.organization.id,
            whole: this.payload.whole,
            departments: this.payload.whole ? [] : this.payload.departments
          }
        })
        .then(() => {
          this.visible = false
          this._index()
        })
        .finally(() => {
          this.saveLoading = false
        })
    }
  }
})
