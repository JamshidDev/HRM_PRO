import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useNotificationStore = defineStore('notificationStore', {
    state: () => ({
        list: [],
        params: {
            page: 1,
            per_page: 10,
            search: null
        },
        visible: false,
        totalItems: 0,
        payload: {
            filter: {
                organizations: [],
                roles: [],
            },
            all: false,
            unCheck: [],
            title: null,
            message: '',
            organizations: [],
            userIds: [],
            alert: null,
        },
    }),
    actions: {
        _index() {
            this.loading = true
            $ApiService.notificationService
                ._index({ params: this.params })
                .then((res) => {
                    this.list = res.data.data.data
                    this.totalItems = res.data.data.total
                })
                .finally(() => {
                    this.loading = false
                })
        },
        openVisible(data) {
            this.visible = data
        },
        resetForm() {
            this.payload.filter.organizations = []
            this.payload.filter.roles = []
            this.payload.all = false
            this.payload.unCheck = []
            this.payload.title = null
            this.payload.message = ''
            this.payload.organizations = []
            this.payload.userIds = []
            this.payload.alert = null
        }
    }
})
