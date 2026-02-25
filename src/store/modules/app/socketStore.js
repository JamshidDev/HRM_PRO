import { defineStore } from 'pinia'
import io from 'socket.io-client'
const socketUrl = import.meta.env.VITE_SOCKET_URL
const socketSecret = import.meta.env.VITE_SOCKET_SECRET
import { useNotify } from '@/composables/useNotify'
import { eventBus, Events } from '@/utils/index.js'

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
      let playAudioUnlocked = false

      let notificationAudio = new Audio('/sounds/notification.mp3')

      const unlockPlayNotification = () => {
        notificationAudio
          .play()
          .then(() => {
            notificationAudio.pause()
            notificationAudio.currentTime = 0
            playAudioUnlocked = true
          })
          .catch(() => {})

        window.removeEventListener('click', unlockPlayNotification)
      }

      window.addEventListener('click', unlockPlayNotification)

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
        if (allowedAlertTypes.includes(data?.alert)) {
          if (playAudioUnlocked) {
            notificationAudio.currentTime = 0
            notificationAudio?.play()
          }

          // eslint-disable-next-line no-constant-binary-expression
          useNotify().notify(data.title || '', 'success' ?? data.alert, {
            meta: data,
            duration: data.duration || undefined,
            persistent: false
          })
        }

        if (allowedEvents.includes(data.type)) {
          eventBus.emit(data.type, data)
        }

        if (data.type === Events.DOCUMENT_COUNT) {
          this.updateCount(data.counts)
        }
      })

      this.socket.on('online_users', (data) => {
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
    addUserToOnlineUsers(user) {
      const existUser = this.allOnlineUsers.find((v) => Number(v.id) === Number(user.id))
      if (existUser) return
      this.allOnlineUsers.push(user)
    },
    removeUserFromOnlineUsers(user) {
      this.allOnlineUsers = this.allOnlineUsers.filter((v) => Number(v.id) !== Number(user.id))
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
