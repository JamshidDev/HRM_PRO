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
      per_page: 15,
      search: null
    },
    userUnreadNotificationsParams: {
      page: 1,
      per_page: 15,
      search: null
    },
    userNotificationsTotal: 0,
    showLoading: false,
    visible: false,
    totalItems: 0,
    structureCheck: [],
    // Push loglari (yuborish tarixi + rejalashtirilgan navbat)
    pushLogs: [],
    pushLogsTotal: 0,
    pushLogsLoading: false,
    pushLogsParams: {
      page: 1,
      per_page: 15,
      status: null
    },
    // Xabar yuborish formasi modali (Xabar tugmasi ochadi).
    formVisible: false,
    // Yuborish rejimi: 'topic' (FCM topic: all/hr/economist) yoki 'manual' (userlarni tanlab).
    mode: 'topic',
    payload: {
      filter: {
        organizations: [],
        roles: []
      },
      all: false,
      unCheck: [],
      // Ko'p tilli — {uz, ru, en}. Mock (example) data bilan to'ldirilgan.
      title: {
        uz: 'Tizimda yangilanish',
        ru: 'Обновление системы',
        en: 'System update'
      },
      message: {
        uz: "Iltimos, biroz kuting — tizim tez orada tayyor bo'ladi.",
        ru: 'Пожалуйста, подождите — система скоро будет готова.',
        en: 'Please wait — the system will be ready soon.'
      },
      organizations: [],
      userIds: [],
      // action — hozircha faqat {type (xabar turi)}; page/params keyin. Default 'info'.
      action: { type: 'info' },
      // Topic rejimi uchun tanlangan topic kodi.
      topic: 'all',
      // Qurilma turi — faqat qo'lda yuborishda; ikkalasi ham standart yoqiq.
      platforms: ['mobile', 'web'],
      // Rejalashtirilgan yuborish vaqti (null = darhol).
      scheduled_at: null
    },
    params: {
      page: 1,
      per_page: 15,
      search: null
    }
  }),
  actions: {
    _userUnreadNotificationsCount() {
      $ApiService.notificationService
        ._user_index({
          params: {
            count: true,
            read_at: true
          }
        })
        .then((res) => {
          this.userUnreadNotificationsCount = res.data.data
        })
    },
    _userUnreadNotifications() {
      this.userUnreadNotificationsLoading = true
      $ApiService.notificationService
        ._user_index({ params: { ...this.userUnreadNotificationsParams, read_at: true } })
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
    _mark_read(payload = { ids: [], all: false }, callback) {
      if (!payload?.all && !payload?.ids.length) return
      $ApiService.notificationService
        ._user_read({
          data: payload
        })
        .then(() => {
          if (payload.all) {
            this.userUnreadNotifications = []
            this.userUnreadNotificationsCount = 0
          } else if (payload.ids.length) {
            const len = this.userUnreadNotifications.length
            this.userUnreadNotifications = this.userUnreadNotifications.filter(
              (i) => !payload?.ids?.includes(i.id)
            )
            if (len !== this.userUnreadNotifications.length) {
              this.userUnreadNotificationsCount -= len - this.userUnreadNotifications.length
            }
          }
        })
        .finally(() => {
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
        // action — {type, page, params}. alert = action.type (backend backward-compat).
        alert: this.payload.action.type,
        action: this.payload.action,
        platforms: this.payload.platforms,
        scheduled_at: this.payload.scheduled_at || undefined
      }
      if (this.payload.userIds.length > 1) {
        payload.filter = {
          userIds: this.payload.userIds,
          all: this.payload.all,
          unCheck: this.payload.unCheck,
          organizations: this.payload.filter.organizations.map((i) => i.id).toString() || undefined,
          roles: this.payload.filter.roles.join(',') || undefined
        }
        $ApiService.notificationService
          ._send_batch({ data: payload })
          .then(() => {
            this.resetForm()
            this._push_logs()
          })
          .finally(() => {
            this.saveLoading = false
          })
      } else if (this.payload.userIds?.[0]) {
        payload.userId = this.payload.userIds[0]
        $ApiService.notificationService
          ._send({ data: payload })
          .then(() => {
            this.resetForm()
            this._push_logs()
          })
          .finally(() => {
            this.saveLoading = false
          })
      }
    },
    _send_topic() {
      this.saveLoading = true
      const payload = {
        topic: this.payload.topic,
        type: 'notification',
        title: this.payload.title,
        message: this.payload.message,
        alert: this.payload.action.type,
        action: this.payload.action,
        scheduled_at: this.payload.scheduled_at || undefined
      }
      $ApiService.notificationService
        ._send_topic({ data: payload })
        .then(() => {
          this.resetForm()
          this._push_logs()
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    _push_logs() {
      this.pushLogsLoading = true
      $ApiService.notificationService
        ._push_logs({ params: this.pushLogsParams })
        .then((res) => {
          this.pushLogs = res.data.data.data
          this.pushLogsTotal = res.data.data.total
        })
        .finally(() => {
          this.pushLogsLoading = false
        })
    },
    _cancel_push(id, callback) {
      $ApiService.notificationService
        ._cancel_push({ id })
        .then(() => {
          this._push_logs()
        })
        .finally(() => {
          callback?.()
        })
    },
    openVisible(data) {
      this.visible = data
    },
    setViewingNotification(item) {
      this.viewingNotification = item
      if (item?.id) {
        this._mark_read({
          ids: [item.id]
        })
      }
    },
    // Xabar formasi modalini ochadi (avval formani tozalab).
    openForm() {
      this.resetForm()
      this.formVisible = true
    },
    resetForm() {
      this.formVisible = false
      this.mode = 'topic'
      this.payload.filter.organizations = []
      this.payload.filter.roles = []
      this.payload.all = false
      this.payload.unCheck = []
      this.payload.title = {
        uz: 'Tizimda yangilanish',
        ru: 'Обновление системы',
        en: 'System update'
      }
      this.payload.message = {
        uz: "Iltimos, biroz kuting — tizim tez orada tayyor bo'ladi.",
        ru: 'Пожалуйста, подождите — система скоро будет готова.',
        en: 'Please wait — the system will be ready soon.'
      }
      this.payload.organizations = []
      this.payload.userIds = []
      this.payload.action = { type: 'info' }
      this.payload.topic = 'all'
      this.payload.platforms = ['mobile', 'web']
      this.payload.scheduled_at = null
    }
  }
})
