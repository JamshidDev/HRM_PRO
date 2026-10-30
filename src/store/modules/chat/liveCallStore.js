import { defineStore } from 'pinia'
import { markRaw, watch } from 'vue'
import i18n from '@/i18n/index.js'
import service from '@/service/v1/chat/liveChatService.js'
import { useAccountStore } from '@/store/modules/app/accountStore.js'
import {
  AUDIO_CONSTRAINTS,
  CAMERA_CONSTRAINTS,
  MEDIA_LIMITS,
  createCallConnection
} from '@/pages/chat/live-chat/call/callConnection.js'
import { callSounds } from '@/pages/chat/live-chat/call/callSounds.js'

const HEARTBEAT_MS = 10_000
// Ketma-ket 3 ta yomon o'lchov (~6 s) — avval kamera, keyin ekran o'chiriladi.
const BAD_STREAK_LIMIT = 3
const ENDED_VIEW_MS = 6000

const data = (res) => res.data.data

// Qo'ng'iroq qiluvchi eshitadigan band signali shu holatlarda chalinadi.
const BUSY_TONE_STATUSES = ['busy', 'missed', 'rejected']

// Kiruvchi qo'ng'iroqda boshqa tabdagi foydalanuvchi ko'rishi uchun sarlavha miltillaydi.
const createTitleFlash = () => {
  let timer = null
  let original = null
  return {
    start(text) {
      this.stop()
      original = document.title
      timer = setInterval(() => {
        document.title = document.title === text ? original : text
      }, 1000)
    },
    stop() {
      clearInterval(timer)
      timer = null
      if (original != null) document.title = original
      original = null
    }
  }
}

export const useLiveCallStore = defineStore('liveCallStore', {
  state: () => ({
    phase: 'idle', // idle | outgoing | incoming | connecting | active | ended
    call: null,
    peer: null,
    iceServers: [],
    micOn: true,
    cameraOn: false,
    screenOn: false,
    remoteCamera: false,
    remoteScreen: false,
    localStream: null,
    remoteMain: null,
    remoteScreenStream: null,
    quality: 'unknown',
    relayed: false,
    answeredAt: null,
    now: Date.now(),
    warningSec: null,
    notice: null,
    ended: null,
    accepting: false
  }),
  getters: {
    isBusy: (s) => s.phase !== 'idle' && s.phase !== 'ended',
    isVideo: (s) => s.call?.type === 'video',
    elapsedSec: (s) => (s.answeredAt ? Math.max(0, Math.floor((s.now - s.answeredAt) / 1000)) : 0),
    remainingSec() {
      return this.call ? Math.max(0, this.call.max_duration_sec - this.elapsedSec) : 0
    }
  },
  actions: {
    canCall() {
      const acc = useAccountStore()
      return acc.checkPermission(acc.pn.chatLiveCall)
    },

    // Socket hodisalari bir marta ulanadi (qayta ulanishda socket obyekti almashadi).
    onSocketConnect(socket) {
      const acc = useAccountStore()
      if (!acc.permissionsLoaded) {
        const stop = watch(
          () => acc.permissionsLoaded,
          (ready) => {
            if (!ready) return
            stop()
            this.onSocketConnect(socket)
          }
        )
        return
      }
      if (!this.canCall() || this._socket === socket) return
      const handlers = {
        'chat:call:incoming': (d) => this.onIncoming(d),
        'chat:call:accepted': (d) => this.onAccepted(d),
        'chat:call:ended': (d) => this.onEnded(d),
        'chat:call:signal': (d) => this.onSignal(d),
        'chat:call:warning': (d) => this.onWarning(d)
      }
      if (this._socket) Object.entries(handlers).forEach(([ev]) => this._socket.off(ev))
      Object.entries(handlers).forEach(([ev, fn]) => socket.on(ev, fn))
      this._socket = markRaw(socket)
    },

    async startCall(conversationId, type, peer) {
      if (this.isBusy) return
      this.reset()
      this.peer = peer
      this.phase = 'outgoing'
      try {
        await this.openMedia(type === 'video')
        const res = data(
          await service._startCall({ conversation_id: conversationId, type, platform: 'web' })
        )
        this.call = res.call
        this.iceServers = res.ice_servers ?? []
        if (res.call.status !== 'ringing') return this.finishView(res.call)
        callSounds.ringback()
      } catch {
        this.cleanup()
        this.phase = 'idle'
      }
    },

    onIncoming({ call, caller }) {
      if (this.isBusy) return
      this.reset()
      this.call = call
      this.peer = caller ? { id: caller.id, fullName: caller.full_name, photo: caller.photo } : null
      this.phase = 'incoming'
      callSounds.ringtone()
      this._title().start(`📞 ${this.peer?.fullName ?? ''}`)
    },

    async accept() {
      if (this.phase !== 'incoming' || this.accepting) return
      this.accepting = true
      this._stopAlerts()
      try {
        await this.openMedia(this.call.type === 'video')
        const res = data(await service._acceptCall(this.call.id))
        this.call = res.call
        this.iceServers = res.ice_servers ?? []
        this.connect(false)
      } catch {
        this.cleanup()
        this.phase = 'idle'
      } finally {
        this.accepting = false
      }
    },

    async reject() {
      if (this.phase !== 'incoming') return
      const id = this.call.id
      this.cleanup()
      this.phase = 'idle'
      await service._rejectCall(id).catch(() => {})
    },

    async hangup() {
      if (!this.call || !this.isBusy) return
      const id = this.call.id
      const relayed = this.relayed
      const res = await service._endCall(id, { relayed }).catch(() => null)
      if (res) this.finishView(data(res).call)
      else this.reset()
    },

    onAccepted({ call }) {
      if (call.id !== this.call?.id) return
      // Boshqa qurilmada qabul qilindi — bu qurilmada jiringlash to'xtaydi.
      if (this.phase === 'incoming' && !this.accepting) {
        this.cleanup()
        this.phase = 'idle'
        return
      }
      this.call = call
      if (this.phase === 'outgoing') {
        this._stopAlerts()
        this.connect(true)
      }
    },

    onSignal({ call_id: callId, payload }) {
      if (callId !== this.call?.id || !this._conn) return
      if (payload?.meta) {
        if ('camera' in payload.meta) this.remoteCamera = !!payload.meta.camera
        if ('screen' in payload.meta) this.remoteScreen = !!payload.meta.screen
        return
      }
      this._conn.handleSignal(payload).catch(() => {})
    },

    onEnded({ call }) {
      if (call.id !== this.call?.id) return
      // Javob berilmagan kiruvchi qo'ng'iroq tugasa — oyna shunchaki yopiladi.
      if (this.phase === 'incoming') {
        this.cleanup()
        this.phase = 'idle'
        return
      }
      this.finishView(call)
    },

    onWarning({ call_id: callId, remaining_sec: sec }) {
      if (callId === this.call?.id) this.warningSec = sec
    },

    async toggleMic() {
      const track = this.localStream?.getAudioTracks()[0]
      if (!track) return
      track.enabled = !track.enabled
      this.micOn = track.enabled
    },

    async toggleCamera() {
      if (this.cameraOn) return this.setCamera(false)
      return this.setCamera(true)
    },

    // Kamera o'chirilganda trek to'xtatiladi — trafik va maxfiylik uchun.
    async setCamera(on, auto = false) {
      if (!this._conn && !on) return
      if (on) {
        const stream = await navigator.mediaDevices
          .getUserMedia({ video: CAMERA_CONSTRAINTS })
          .catch(() => null)
        const track = stream?.getVideoTracks()[0]
        if (!track) return
        this.localStream
          ?.getVideoTracks()
          .forEach((t) => (t.stop(), this.localStream.removeTrack(t)))
        this.localStream?.addTrack(track)
        await this._conn?.setCamera(track)
      } else {
        this.localStream
          ?.getVideoTracks()
          .forEach((t) => (t.stop(), this.localStream.removeTrack(t)))
        await this._conn?.setCamera(null)
      }
      this.cameraOn = on
      if (auto) this.notice = 'cameraAutoOff'
      this.sendMeta({ camera: on })
    },

    async toggleScreen() {
      if (this.screenOn) return this.stopScreen()
      const stream = await navigator.mediaDevices
        .getDisplayMedia({
          video: { frameRate: { ideal: MEDIA_LIMITS.screenFps, max: MEDIA_LIMITS.screenFps } },
          audio: false
        })
        .catch(() => null)
      const track = stream?.getVideoTracks()[0]
      if (!track) return
      track.onended = () => this.stopScreen()
      this._screenStream = markRaw(stream)
      await this._conn?.setScreen(track)
      this.screenOn = true
      this.sendMeta({ screen: true })
    },

    async stopScreen(auto = false) {
      this._screenStream?.getTracks().forEach((t) => t.stop())
      this._screenStream = null
      await this._conn?.setScreen(null)
      this.screenOn = false
      if (auto) this.notice = 'screenAutoOff'
      this.sendMeta({ screen: false })
    },

    redial() {
      const { call, peer } = this
      if (!call) return
      this.startCall(call.conversation_id, call.type, peer)
    },

    closeEnded() {
      if (this.phase === 'ended') this.reset()
    },

    // ── Ichki ────────────────────────────────────────────────────────────────

    async openMedia(withCamera) {
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: AUDIO_CONSTRAINTS,
          video: withCamera ? CAMERA_CONSTRAINTS : false
        })
      } catch (e) {
        window.$Alert?.validation(i18n.global.t('liveCall.mediaDenied'))
        throw e
      }
      this.localStream = markRaw(stream)
      this.micOn = true
      this.cameraOn = withCamera && stream.getVideoTracks().length > 0
    },

    connect(initiator) {
      const conn = createCallConnection({
        iceServers: this.iceServers,
        initiator,
        onSignal: (payload) => this.emitSignal(payload),
        onRemote: ({ main, screen }) => {
          this.remoteMain = markRaw(main)
          this.remoteScreenStream = markRaw(screen)
        },
        onStats: (s) => this.onStats(s),
        onState: (state) => {
          if (state === 'connected' && this.phase === 'connecting') {
            this.phase = 'active'
            this.answeredAt ??= Date.now()
          }
        }
      })
      this._conn = markRaw(conn)
      this.phase = 'connecting'
      this.answeredAt = Date.now()
      conn.setMic(this.localStream.getAudioTracks()[0] ?? null)
      conn.setCamera(this.localStream.getVideoTracks()[0] ?? null)
      conn.startStats()
      this.sendMeta({ camera: this.cameraOn, screen: false })
      this.startTimers()
    },

    onStats({ quality, relayed }) {
      this.quality = quality
      this.relayed = this.relayed || relayed
      this._bad = quality === 'bad' ? (this._bad ?? 0) + 1 : 0
      if (this._bad < BAD_STREAK_LIMIT) return
      this._bad = 0
      if (this.cameraOn) this.setCamera(false, true)
      else if (this.screenOn) this.stopScreen(true)
    },

    emitSignal(payload) {
      this._socket?.emit('chat:call:signal', {
        call_id: this.call?.id,
        payload: JSON.parse(JSON.stringify(payload))
      })
    },

    sendMeta(meta) {
      if (this._conn) this.emitSignal({ meta })
    },

    startTimers() {
      const beat = () =>
        this._socket?.emit('chat:call:heartbeat', { call_id: this.call?.id, relayed: this.relayed })
      beat()
      this._hb = setInterval(beat, HEARTBEAT_MS)
      this._tick = setInterval(() => (this.now = Date.now()), 1000)
    },

    finishView(call) {
      this.cleanup()
      const iCalled = call.caller_id === useAccountStore().account?.id
      if (iCalled && BUSY_TONE_STATUSES.includes(call.status)) callSounds.busy()
      this.call = call
      this.ended = { status: call.status, reason: call.end_reason, duration: call.duration_sec }
      this.phase = 'ended'
      this._endedTimer = setTimeout(() => this.closeEnded(), ENDED_VIEW_MS)
    },

    cleanup() {
      this._stopAlerts()
      clearInterval(this._hb)
      clearInterval(this._tick)
      clearTimeout(this._endedTimer)
      this._conn?.close()
      this._conn = null
      this.localStream?.getTracks().forEach((t) => t.stop())
      this._screenStream?.getTracks().forEach((t) => t.stop())
      this._screenStream = null
      this.localStream = null
      this.remoteMain = null
      this.remoteScreenStream = null
    },

    reset() {
      this.cleanup()
      Object.assign(this, {
        phase: 'idle',
        call: null,
        peer: null,
        cameraOn: false,
        screenOn: false,
        remoteCamera: false,
        remoteScreen: false,
        quality: 'unknown',
        relayed: false,
        answeredAt: null,
        warningSec: null,
        notice: null,
        ended: null
      })
    },

    _stopAlerts() {
      callSounds.stop()
      this._title().stop()
    },

    _title() {
      this._flash ??= markRaw(createTitleFlash())
      return this._flash
    }
  }
})
