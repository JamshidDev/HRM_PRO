import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

// Hujjat sozlamalari (barcha korxonalar uchun bitta): orqa sana chegarasi, imzolash muddati, elektron raqam prefiksi.
export const useDocumentSettingsStore = defineStore('documentSettingsStore', {
  state: () => ({
    loading: false,
    saving: false,
    loaded: null,
    form: {
      backdate_days: 7,
      sign_deadline_days: 3,
      electronic_prefix: 'UTY'
    }
  }),

  getters: {
    dirty: (state) =>
      !!state.loaded &&
      (state.form.backdate_days !== state.loaded.backdate_days ||
        state.form.sign_deadline_days !== state.loaded.sign_deadline_days ||
        state.form.electronic_prefix !== state.loaded.electronic_prefix)
  },

  actions: {
    _apply(data) {
      this.loaded = data
      this.form = {
        backdate_days: data.backdate_days,
        sign_deadline_days: data.sign_deadline_days,
        electronic_prefix: data.electronic_prefix
      }
    },

    async _show() {
      this.loading = true
      try {
        const res = await $ApiService.documentSettingsService._show()
        this._apply(res.data.data)
      } finally {
        this.loading = false
      }
    },

    async _save() {
      this.saving = true
      try {
        const res = await $ApiService.documentSettingsService._update({ data: { ...this.form } })
        this._apply(res.data.data)
        $Toast.success(t('documentSettings.saved'))
        return true
      } catch {
        // Xabarni axios interceptor ko'rsatadi.
        return false
      } finally {
        this.saving = false
      }
    }
  }
})
