import {defineStore} from "pinia";
import io from 'socket.io-client';
const socketUrl = import.meta.env.VITE_SOCKET_URL
const socketSecret = import.meta.env.VITE_SOCKET_SECRET

export const useSocketStore = defineStore('useSocketStore', {
    state:()=>({
        socket: null,
        currentUserId: null,
        onlineUsers: new Map(),
        idleTimer: null,
        allOnlineUsers:[],
        userVisible:false,
    }),
    actions:{
        initSocket(token, userId) {
            this.currentUserId = userId
            this.socket = io(socketUrl,{
                auth:{
                    userId:userId,
                    token:token,
                    secret:socketSecret,
                },
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                transports: ['websocket'],
            });

            this.socket.on('connect', () => {
                console.info('<=== Socket connected:', this.socket.id + '===>');

                this.setupIdleDetection()
                this.getAllOnlineUsers()

            });

            this.socket.on('disconnect', () => {
                console.error('>>> Socket disconnected <<<');
            });

            this.socket.on('user:online', (data) => {
                this.addUserToOnlineUsers(data.user)
            });

            this.socket.on('user:offline', (data) => {
                this.removeUserFromOnlineUsers(data.user)
            });

            this.socket.on('export_ready', (data) => {
                console.log(data)
                $Toast.info('Export ready');
            })

            this.socket.on('online_users', (data) => {
                for(let key in data){
                    const user = data[key]
                    this.addUserToOnlineUsers(user)
                }
            })

        },

        getAllOnlineUsers(){
            if(!this.socket) return
            this.socket.emit('get_online_users')
        },

        setOnline(userId) {
            this.currentUserId = userId;
            if (!this.socket) this.initSocket();
            this.socket.emit('user:online', userId);
        },
        setupIdleDetection(){
            ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
                document.addEventListener(event, () => this.resetIdleTimer());
            })

            this.resetIdleTimer();
        },

        resetIdleTimer() {
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(() => {
                console.error('user:inactive')
                if (this.socket && this.currentUserId) {
                    this.socket.emit('user:inactive', this.currentUserId);
                }
            }, 30 * 60 * 1000); // 30 minutes
        },
        addUserToOnlineUsers(user){
            const existUser = this.allOnlineUsers.find(v=>v.id === user.id)
            if(existUser) return
            this.allOnlineUsers.push(user)
        },
        removeUserFromOnlineUsers(user){
            this.allOnlineUsers = this.allOnlineUsers.filter(v=>v.id !== user.id)
        },
        setOffline() {
            if (this.socket && this.currentUserId) {
                this.socket.disconnect();
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