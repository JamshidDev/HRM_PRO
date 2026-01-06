import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useNotificationStore = defineStore('notificationStore', {
    state: () => ({
        list: [],
        loading: false,
        saveLoading: false,

        showLoading: false,
        visible: false,
        totalItems: 0,
        structureCheck: [],
        payload: {
            title: null,
            message: '',
            organizations: [],
            userIds: [],
            type: 'notification',
            alert: null,
        },
        params: {
            page: 1,
            per_page: 10,
            search: null
        }
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
        _send() {
            // this.saveLoading = true
            // let data = {
            //     ...this.payload,
            //     organizations: this.payload.organizations.map((v) => v.id)
            // }
            $ApiService.topicService
                ._create({ data })
                .then((res) => {
                    this.visible = false
                    this._index()
                })
                .finally(() => {
                    this.saveLoading = false
                })
        },
        openVisible(data) {
            this.visible = data
        },
        resetForm() {
            this.payload.title = null
            this.payload.message = ''
            this.payload.organizations = []
            this.payload.userIds = []
            this.payload.type = null
            this.payload.alert = null
        }
    }
})
