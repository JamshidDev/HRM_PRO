import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import service from '@/service/v1/attestation/examMonitoringService.js'
import { useExamVideoStore } from '@/store/modules/attestation/examVideoStore.js'

// Nomzod tomoni: ekran ulashish talabi va kuzatuvchiga kamera/ekran oqimini uzatish (faqat yuborish).
export const useExamProctorStore = defineStore('examProctorStore', {
  state: () => ({
    attemptId: null,
    camera: false,
    screen: false,
    screenStream: null,
    screenError: null,
    // Kuzatuvchidan kelgan ogohlantirishlar navbati (birma-bir ko'rsatiladi).
    alerts: [],
    _sessions: {},
    _socket: null
  }),
  getters: {
    needScreen: (s) => s.screen && !s.screenStream
  },
  actions: {
    // Yechish sahifasi ochilganda urinish talablari olinadi.
    async loadAttempt(attemptId) {
      if (this.attemptId === attemptId) return
      this.attemptId = attemptId
      try {
        const res = await service._requirements(attemptId)
        this.camera = res.data.data.camera
        this.screen = res.data.data.screen
      } catch {
        this.camera = false
        this.screen = false
      }
    },

    leaveAttempt() {
      this.attemptId = null
      this.screen = false
      this.camera = false
      this.stopScreen()
      Object.keys(this._sessions).forEach((sid) => this.closeSession(sid))
    },

    // Faqat butun ekran qabul qilinadi (oyna/tab emas).
    async shareScreen() {
      this.screenError = null
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor', frameRate: 5 },
          audio: false
        })
        const track = stream.getVideoTracks()[0]
        if (
          track?.getSettings?.().displaySurface &&
          track.getSettings().displaySurface !== 'monitor'
        ) {
          stream.getTracks().forEach((t) => t.stop())
          this.screenError = 'not_monitor'
          return
        }
        track.onended = () => {
          this.screenStream = null
        }
        this.screenStream = markRaw(stream)
      } catch {
        this.screenError = 'denied'
      }
    },

    stopScreen() {
      this.screenStream?.getTracks().forEach((t) => t.stop())
      this.screenStream = null
    },

    bindSocket(socket) {
      if (!socket || this._socket === socket) return
      if (this._socket) {
        this._socket.off('exam:watch:start', this._onStart)
        this._socket.off('exam:watch:signal', this._onSignal)
        this._socket.off('exam:watch:stop', this._onStop)
        this._socket.off('exam:proctor:alert', this._onAlert)
      }
      this._onStart = (d) => this.startSession(d)
      this._onSignal = (d) => this.onSignal(d)
      this._onStop = (d) => this.closeSession(d?.session_id)
      this._onAlert = (d) => {
        if (d?.text && Number(d.worker_exam_id) === Number(this.attemptId)) this.alerts.push(d)
      }
      socket.on('exam:proctor:alert', this._onAlert)
      socket.on('exam:watch:start', this._onStart)
      socket.on('exam:watch:signal', this._onSignal)
      socket.on('exam:watch:stop', this._onStop)
      this._socket = markRaw(socket)
    },

    // Kuzatuvchi so'rovi: mavjud oqimlar bilan offer yuboriladi.
    async startSession(d) {
      if (!d?.session_id || !this.attemptId || Number(d.worker_exam_id) !== Number(this.attemptId))
        return
      const cam = useExamVideoStore().stream
      const scr = this.screenStream
      const pc = new RTCPeerConnection({ iceServers: d.ice_servers || [] })
      this._sessions[d.session_id] = markRaw(pc)
      pc.onicecandidate = (e) => {
        if (e.candidate) this.emit(d.session_id, { candidate: e.candidate.toJSON() })
      }
      const streams = {}
      if (d.camera && cam) {
        cam.getVideoTracks().forEach((t) => pc.addTrack(t, cam))
        streams.camera = cam.id
      }
      if (d.screen && scr) {
        scr.getVideoTracks().forEach((t) => pc.addTrack(t, scr))
        streams.screen = scr.id
      }
      // Talab qilingan, lekin hali yo'q oqimlar kuzatuvchiga aytiladi (masalan ekran ulashilmagan).
      const missing = []
      if (d.screen && !scr) missing.push('screen')
      if (d.camera && !cam) missing.push('camera')
      this.emit(d.session_id, { meta: { streams, missing } })
      if (!streams.camera && !streams.screen) {
        this.closeSession(d.session_id)
        return
      }
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      this.emit(d.session_id, { sdp: pc.localDescription.toJSON() })
    },

    async onSignal(d) {
      if (!d || d.from_role !== 'watcher') return
      const pc = this._sessions[d.session_id]
      if (!pc) return
      const p = d.payload || {}
      try {
        if (p.sdp?.type === 'answer') await pc.setRemoteDescription(p.sdp)
        if (p.candidate) await pc.addIceCandidate(p.candidate)
      } catch (e) {
        console.error('[exam-proctor] signal', e)
      }
    },

    emit(sessionId, payload) {
      this._socket?.emit('exam:watch:signal', {
        session_id: sessionId,
        role: 'candidate',
        payload
      })
    },

    dismissAlert() {
      this.alerts.shift()
    },

    closeSession(sid) {
      const pc = this._sessions[sid]
      if (pc) pc.close()
      delete this._sessions[sid]
    }
  }
})
