import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import i18n from '@/i18n/index.js'
import service from '@/service/v1/attestation/examMonitoringService.js'
import { useSocketStore } from '@/store/modules/app/socketStore.js'

const CONNECT_TIMEOUT_MS = 15000
const SOLVING_REFRESH_MS = 10000

// Kuzatuvchi tomoni: nomzod kamera/ekran oqimini WebRTC orqali qabul qiladi (faqat qabul).
export const useExamMonitoringStore = defineStore('examMonitoringStore', {
  state: () => ({
    list: [],
    total: 0,
    loading: false,
    params: { page: 1, per_page: 15, search: null },

    drawer: false,
    topic: null,
    solving: [],
    solvingLoading: false,
    // Chap panel tabi: live — hozir yechayotganlar, finished — yechib bo'lganlar.
    tab: 'live',
    finished: [],
    finishedTotal: 0,
    finishedLoading: false,
    finishedParams: { page: 1, per_page: 20 },
    selectedFinished: null,
    alertLoading: false,
    // Nomzodda yo'q oqimlar: ['screen', 'camera'].
    missing: [],
    active: null,
    // idle | connecting | live | failed | unavailable
    status: 'idle',
    message: null,
    cameraStream: null,
    screenStream: null,

    _session: null,
    _pc: null,
    _socket: null,
    _timer: null,
    _refresh: null,
    _streams: {}
  }),
  actions: {
    _index() {
      this.loading = true
      service
        ._topics({ ...this.params, search: this.params.search || undefined })
        .then((res) => {
          this.list = res.data.data.data
          this.total = res.data.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },

    openDrawer(topic) {
      this.topic = topic
      this.drawer = true
      this.tab = 'live'
      this.finished = []
      this.selectedFinished = null
      this.active = null
      this.status = 'idle'
      this.bindSocket()
      this._solving(true)
      clearInterval(this._refresh)
      this._refresh = setInterval(() => this._solving(false), SOLVING_REFRESH_MS)
    },

    closeDrawer() {
      clearInterval(this._refresh)
      this.closeWatch()
      this.drawer = false
      this.unbindSocket()
      this._index()
    },

    // Yechayotganlar ro'yxati; birinchi ochilishda avtomatik birinchisiga ulanadi.
    _solving(autoWatch) {
      if (!this.topic) return
      if (autoWatch) this.solvingLoading = true
      service
        ._solving(this.topic.id)
        .then((res) => {
          this.solving = res.data.data.data
          if (autoWatch && this.solving.length) this.watch(this.solving[0])
          if (
            this.active &&
            !this.solving.some((s) => s.worker_exam_id === this.active.worker_exam_id)
          ) {
            this.closeWatch()
            this.message = 'finished'
          }
        })
        .finally(() => {
          this.solvingLoading = false
        })
    },

    setTab(tab) {
      this.tab = tab
      if (tab === 'finished') {
        this.closeWatch()
        this.finishedParams.page = 1
        this._finished(false)
      } else {
        this.selectedFinished = null
      }
    },

    // Yechganlar: «Yana yuklash» bilan keyingi sahifa qo'shiladi.
    _finished(append) {
      if (!this.topic) return
      this.finishedLoading = true
      service
        ._finished(this.topic.id, this.finishedParams)
        .then((res) => {
          const d = res.data.data
          this.finished = append ? [...this.finished, ...d.data] : d.data
          this.finishedTotal = d.total
        })
        .finally(() => {
          this.finishedLoading = false
        })
    },

    loadMoreFinished() {
      this.finishedParams.page += 1
      this._finished(true)
    },

    // Nomzod oynasiga ogohlantirish (tayyor yoki o'z matni).
    sendAlert(text) {
      if (!this.active || !text?.trim()) return Promise.resolve()
      this.alertLoading = true
      return service
        ._alert(this.active.worker_exam_id, text.trim())
        .then(() => $Toast.success(i18n.global.t('examMonitoringPage.alertSent')))
        .finally(() => {
          this.alertLoading = false
        })
    },

    selectFinished(row) {
      this.closeWatch()
      this.selectedFinished = row
    },

    async watch(row) {
      this.selectedFinished = null
      this.closeWatch()
      this.active = row
      this.message = null
      if (!row.camera && !row.screen) {
        this.status = 'unavailable'
        return
      }
      this.status = 'connecting'
      try {
        const res = await service._watch(row.worker_exam_id)
        const s = res.data.data
        this._session = s.session_id
        this._streams = {}
        const pc = new RTCPeerConnection({ iceServers: s.ice_servers || [] })
        this._pc = markRaw(pc)
        pc.onicecandidate = (e) => {
          if (e.candidate) this.emit({ candidate: e.candidate.toJSON() })
        }
        pc.ontrack = (e) => this.onTrack(e)
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            this.status = 'live'
            clearTimeout(this._timer)
          }
          if (['failed', 'disconnected'].includes(pc.connectionState)) {
            this.status = 'failed'
            this.message = 'lost'
          }
        }
        clearTimeout(this._timer)
        this._timer = setTimeout(() => {
          if (this.status === 'connecting') {
            this.status = 'failed'
            this.message = 'timeout'
          }
        }, CONNECT_TIMEOUT_MS)
      } catch {
        this.status = 'failed'
        this.message = 'error'
      }
    },

    // Nomzod meta'da qaysi oqim kamera, qaysi ekran ekanini aytadi.
    onTrack(e) {
      const stream = e.streams[0]
      if (!stream) return
      if (this._streams.screen === stream.id) this.screenStream = markRaw(stream)
      else this.cameraStream = markRaw(stream)
    },

    async onSignal(d) {
      if (!d || d.session_id !== this._session || d.from_role !== 'candidate' || !this._pc) return
      const p = d.payload || {}
      const pc = this._pc
      try {
        if (p.meta?.streams) this._streams = p.meta.streams
        if (p.meta?.missing) this.missing = p.meta.missing
        // Hech bir oqim yo'q — ulanish kutilmaydi.
        if (p.meta && !p.meta.streams?.camera && !p.meta.streams?.screen) {
          clearTimeout(this._timer)
          this.status = 'failed'
          this.message = 'not_shared'
        }
        if (p.sdp?.type === 'offer') {
          await pc.setRemoteDescription(p.sdp)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          this.emit({ sdp: pc.localDescription.toJSON() })
        }
        if (p.candidate) await pc.addIceCandidate(p.candidate)
      } catch (e) {
        console.error('[exam-watch] signal', e)
      }
    },

    emit(payload) {
      this._socket?.emit('exam:watch:signal', {
        session_id: this._session,
        role: 'watcher',
        payload
      })
    },

    closeWatch() {
      clearTimeout(this._timer)
      if (this._pc) this._pc.close()
      if (this._session) service._stop(this._session).catch(() => {})
      this._pc = null
      this._session = null
      this.cameraStream = null
      this.screenStream = null
      this.missing = []
      this.active = null
      this.status = 'idle'
    },

    bindSocket() {
      const socket = useSocketStore().socket
      if (!socket || this._socket === socket) return
      this.unbindSocket()
      this._onSignal = (d) => this.onSignal(d)
      socket.on('exam:watch:signal', this._onSignal)
      this._socket = markRaw(socket)
    },

    unbindSocket() {
      if (this._socket && this._onSignal) this._socket.off('exam:watch:signal', this._onSignal)
      this._socket = null
    }
  }
})
