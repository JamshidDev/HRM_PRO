import { defineStore } from 'pinia'

export const useOthersStore = defineStore('othersStore', {
  state: () => ({
    activeTab: null,
    tabs: ['image_history', 'invalid_users', 'telegram_user', 'sync_log', 'hc_server'],
    pageOptions: []
  }),
  actions: {}
})
