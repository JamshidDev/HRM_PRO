import { defineStore } from 'pinia'
import io from 'socket.io-client'
const socketUrl = import.meta.env.VITE_SOCKET_URL
const socketSecret = import.meta.env.VITE_SOCKET_SECRET
import { useNotify } from '@/composables/useNotify'
import { eventBus, Events } from '@/utils/index.js'

export const useSocketStore = defineStore('useSocketStore', {
  state: () => ({
    socket: null,
    currentUserId: null,
    onlineUsers: new Map(),
    idleTimer: null,
    allOnlineUsers: [],
    userVisible: false,
    reactionEmojiEv: null
  }),
  actions: {
    initSocket(token, userId) {
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
        const notify = useNotify()
        console.log(data)

        notify.notify(data.title || 'Empty message', data?.message || null, data?.alert || 'info')

        if (Events.TASK_COMPLETED === data.type) {
          eventBus.emit(Events.TASK_COMPLETED, data)
        } else if (Events.COMMAND_GENERATED === data.type) {
          eventBus.emit(Events.COMMAND_GENERATED, data)
        } else if (Events.APPLICATION_GENERATED === data.type) {
          eventBus.emit(Events.APPLICATION_GENERATED, data)
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
    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
    }
  }
})
