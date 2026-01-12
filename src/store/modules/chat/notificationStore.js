import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
const { t } = i18n.global
export const useNotificationStore = defineStore('notificationStore', {
    state: () => ({
        list: [],
        userNotifications: [],
        userUnreadNotifications: [],
        userNotificationsLoading: false,
        userUnreadNotificationsLoading: false,
        viewingNotification: null,
        loading: false,
        saveLoading: false,
        userUnreadNotificationsCount: 0,
        userNotificationsParams: {
            page: 1,
            per_page: 10,
            search: null
        },
        userUnreadNotificationsParams: {
            page: 1,
            per_page: 10,
            search: null,
        },
        userNotificationsTotal: 0,
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
        _userUnreadNotificationsCount(){
            $ApiService.notificationService
                ._user_index({ params: {
                        count: true,
                        read_at: true
                    } })
                .then((res) => {
                    this.userUnreadNotificationsCount = res.data.data
                })
        },
        _userUnreadNotifications() {
            this.userUnreadNotificationsLoading = true
            $ApiService.notificationService
                ._user_index({ params: {...this.userUnreadNotificationsParams, read_at: true} })
                .then((res) => {
                    this.userUnreadNotifications.push(...res.data.data.data)
                })
                .finally(() => {
                    this.userUnreadNotificationsLoading = false
                })
        },
        _user_index() {
            this.userNotificationsLoading = true
            $ApiService.notificationService
                ._user_index({ params: this.userNotificationsParams })
                .then((res) => {
                    this.userNotifications = res.data.data.data
                })
                .finally(() => {
                    this.userNotificationsLoading = false
                })
        },
        _mark_read(payload = {ids: [], all: false}, callback){
            if(!payload?.all && !payload?.ids.length) return
            $ApiService.notificationService._user_read({
                data: payload
            }).then(()=>{
                if(payload.all){
                    this.userUnreadNotifications = []
                    this.userUnreadNotificationsCount = 0
                }else if(payload.ids.length){
                    const len = this.userUnreadNotifications.length
                    this.userUnreadNotifications = this.userUnreadNotifications.filter(i=>!payload?.ids?.includes(i.id))
                    if(len!==this.userUnreadNotifications.length){
                        this.userUnreadNotificationsCount-=(len-this.userUnreadNotifications.length)
                    }
                }
            }).finally(()=>{
                callback?.()
            })
        },
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
                filter: undefined,
                alert: this.payload.alert
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
        setViewingNotification(item){
            this.viewingNotification = item
            if(item?.id){
                this._mark_read({
                    ids: [item.id]
                })
            }
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
