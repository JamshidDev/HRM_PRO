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
            this.saveLoading = true
            let payload = {
                type: 'notification',
                title: this.payload.title,
                message: this.payload.message,
                userId: undefined,
                filter: undefined
            }
            if(this.payload.userIds.length>1){
                payload.filter = {
                    userIds: this.payload.userIds,
                    all: this.payload.all,
                    unCheck: this.payload.unCheck,
                    organizations: this.payload.filter.organizations.map(i=>i.id).toString() || undefined,
                    roles: this.payload.filter.roles.join(',') || undefined,
                }
                $ApiService.notificationService
                    ._send_batch({ data: payload })
                    .then(() => {
                        this.visible = false
                        this._index()
                    })
                    .finally(() => {
                        this.saveLoading = false
                    })
            }else if(this.payload.userIds?.[0]){
                payload.userId = this.payload.userIds[0]
                $ApiService.notificationService
                    ._send({ data: payload })
                    .then(() => {
                        this.visible = false
                        this._index()
                    })
                    .finally(() => {
                        this.saveLoading = false
                    })
            }

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
