import { defineStore } from 'pinia'
import io from 'socket.io-client'
const socketUrl = import.meta.env.VITE_SOCKET_URL
const socketSecret = import.meta.env.VITE_SOCKET_SECRET
import { useNotify } from '@/composables/useNotify'
import { useNotificationSound } from '@/composables/useNotificationSound.js'
import { eventBus, Events } from '@/utils/index.js'
import { pickI18nText } from '@/utils/i18nText.js'
import { useAppStore } from '@/store/modules/app/appStore.js'
import { useNotificationStore } from '@/store/modules/chat/notificationStore.js'
import dayjs from 'dayjs'

const allowedEvents = [
  Events.APPLICATION_GENERATED,
  Events.COMMAND_GENERATED,
  Events.CERTIFICATED_GENERATED,
  Events.TASK_COMPLETED
]
const allowedAlertTypes = ['success', 'error', 'info', 'warning']

export const useSocketStore = defineStore('useSocketStore', {
  state: () => ({
    socket: null,
    currentUserId: null,
    onlineUsers: new Map(),
    idleTimer: null,
    allOnlineUsers: [],
    userVisible: false,
    reactionEmojiEv: null,
    counts: {
      confirmation: {},
      hr: {}
    },




  }),
  getters: {
    getCategoryTotal: (state) => (category) => {
      const fields = state.counts[category]
      if (!fields) return 0
      return Object.values(fields).reduce((sum, val) => sum + val, 0)
    },
    getCount: (state) => (category, field) => {
      return state.counts[category]?.[field] || 0
    }
  },
  actions: {
    initSocket(token, userId) {
      const appStore = useAppStore()
      const notificationSound = useNotificationSound()
      const notificationStore = useNotificationStore()

      this.currentUserId = userId
      this.socket = io(socketUrl, {
        auth: {
          userId: userId,
          token: token,
          secret: socketSecret
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket']
      })

      this.socket.on('connect', () => {
        console.info('<=== Socket connected:', this.socket.id + '===>')

        this.setupIdleDetection()
        this.getAllOnlineUsers()
      })

      this.socket.on('disconnect', () => {
        console.error('>>> Socket disconnected <<<')
      })

      this.socket.on('user:online', (data) => {
        this.addUserToOnlineUsers(data.user)
      })

      this.socket.on('user:offline', (data) => {
        this.removeUserFromOnlineUsers(data.user)
      })

      this.socket.on('notification', (data) => {
        // Xabar turi: yangi payload'da `type` (= action.type), eskisida `alert`.
        const alertType = allowedAlertTypes.includes(data?.type)
          ? data.type
          : allowedAlertTypes.includes(data?.alert)
            ? data.alert
            : null

        if (alertType) {
          if (appStore.soundEnabled) {
            const soundByAlert = { error: 'error', warning: 'notice', info: 'notice' }
            notificationSound.play(soundByAlert[alertType] || 'success')
          }

          // title/message — {uz,ru,en} obyekt; toast joriy tilda ko'rsatiladi.
          useNotify().notify(pickI18nText(data.title), alertType, {
            meta: {
              ...data,
              title: pickI18nText(data.title),
              message: pickI18nText(data.message),
              alert: alertType
            },
            duration: data.duration || undefined,
            persistent: false
          })

          // Qo'ng'iroq panelga JONLI «tushadi» (drop-animatsiya) — toast bilan birga.
          // data.title/message {uz,ru,en} obyekt saqlanadi (widget o'zi tilga o'giradi).
          if (data.id) {
            notificationStore._addUnread({
              id: data.id,
              created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              read_at: null,
              data: { ...data, alert: alertType }
            })
          }
        }

        if (allowedEvents.includes(data.type)) {
          eventBus.emit(data.type, data)
        }

        if (data.type === Events.DOCUMENT_COUNT) {
          this.updateCount(data.counts)
        }
      })

      this.socket.on('online_users', (data) => {
        // Server ro'yxati — yagona manba: uzilishda o'tkazib yuborilgan offline'lar tozalanadi.
        this.allOnlineUsers = []
        for (let key in data) {
          const user = data[key]
          this.addUserToOnlineUsers(user)
        }
      })

      this.socket.on('emoji', (data) => {
        if (!this.reactionEmojiEv) return
        this.reactionEmojiEv(data)
      })
    },

    getAllOnlineUsers() {
      if (!this.socket) return
      this.socket.emit('get_online_users')
    },
    sendNotification(data) {
      if (!this.socket) return
      this.socket.emit('emoji', data)
    },
    registerCallback(callback) {
      this.reactionEmojiEv = callback
    },

    setOnline(userId) {
      this.currentUserId = userId
      if (!this.socket) this.initSocket()
      this.socket.emit('user:online', userId)
    },
    setupIdleDetection() {
      ;['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
        document.addEventListener(event, () => this.resetIdleTimer())
      })

      this.resetIdleTimer()
    },

    resetIdleTimer() {
      clearTimeout(this.idleTimer)
      this.idleTimer = setTimeout(
        () => {
          console.error('user:inactive')
          if (this.socket && this.currentUserId) {
            this.socket.emit('user:inactive', this.currentUserId)
          }
        },
        30 * 60 * 1000
      ) // 30 minutes
    },
    // Har ulanish (socketId) alohida yozuv: web/mobil va har brauzer alohida ko'rinadi.
    onlineKey(user) {
      return user.socketId ?? `user-${user.id}`
    },
    addUserToOnlineUsers(user) {
      const key = this.onlineKey(user)
      const index = this.allOnlineUsers.findIndex((v) => this.onlineKey(v) === key)
      if (index === -1) this.allOnlineUsers.push(user)
      else this.allOnlineUsers.splice(index, 1, { ...this.allOnlineUsers[index], ...user })
    },
    removeUserFromOnlineUsers(user) {
      // socketId bo'lsa — faqat shu ulanish; bo'lmasa (eski server) — userning hammasi.
      this.allOnlineUsers = user.socketId
        ? this.allOnlineUsers.filter((v) => v.socketId !== user.socketId)
        : this.allOnlineUsers.filter((v) => Number(v.id) !== Number(user.id))
    },
    setOffline() {
      if (this.socket && this.currentUserId) {
        this.socket.disconnect()
      }
    },
    updateCount(data) {
      Object.entries(data).forEach(([type, fields]) => {
        if (!this.counts[type]) {
          this.counts[type] = {}
        }
        this.counts[type] = { ...this.counts[type], ...fields }
      })
    },
    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
    }
  }
})
