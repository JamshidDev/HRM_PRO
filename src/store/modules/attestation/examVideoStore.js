import { defineStore } from 'pinia'
import i18n from '@/i18n/index.js'
import axios from 'axios'

const { t } = i18n.global
export const useExamVideoStore = defineStore('examVideoStore', {
  state: () => ({
    loading: false,
    examId: null,
    workerExamId: null,
    chunkIndex: 0,
    chunkUrl: null,
    sessionId: null,
    finishLoading: false,

    videoRef: null,
    canvasRef: null,
    mediaRecorder: null,
    chunks: [],
    stream: null,
    arrayBuffer: null,
    intervalId: null,
    isFinished: false,
    finishCallback: null,
    isUnMounted: false,
    isRecording: false,
    animationFrameId: null,
    showCanvas: false,
    timerOne: null,
    timerTwo: null
  }),
  actions: {
    _start() {
      this.isFinished = false
      this.chunkIndex = 0
      this.loading = true
      const data = {
        exam_id: this.examId,
        worker_exam_id: this.workerExamId
        // exam_id:1,
        // worker_exam_id:1,
      }
      $ApiService.examVideoService
        ._start({ data })
        .then(async (res) => {
          this.chunkUrl = res.data.data.url
          await this._startRecordCamera()
        })
        .finally(() => {
          this.loading = false
        })
    },
    _uploadFile() {
      this.chunkIndex++
      this.loading = true

      const url = this.chunkUrl + `/exam-${Date.now()}-video.webm`
      axios
        .put(url, this.arrayBuffer, {
          'Content-Type': 'application/octet-stream'
        })
        .then(() => {
          if (this.isFinished) {
            this._finishVideo()
          }
        })
        .catch((error) => {})
    },
    _finishVideo() {
      this.finishLoading = true
      const data = {
        worker_exam_id: this.workerExamId
      }
      $ApiService.examVideoService
        ._finishVideo({ data })
        .then((res) => {
          this.finishCallback?.()
        })
        .finally(() => {
          this.finishLoading = false
        })
    },
    async _startRecordCamera() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (this.videoRef) {
          this.videoRef.srcObject = this.stream
          this.videoRef.play()

          const createRecorder = () => {
            this.mediaRecorder = new MediaRecorder(this.stream, {
              mimeType: 'video/webm;codecs=vp8,opus'
            })

            if (this.isUnMounted) {
              this.stream.getTracks().forEach((track) => track.stop())
              this.mediaRecorder.stop()
              return
            }

            this.mediaRecorder.onstart = () => {
              this.isRecording = true
            }

            this.mediaRecorder.ondataavailable = async (e) => {
              if (e.data?.size > 0) {
                const blob = e.data

                const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2)

                // this.downloadBlob(blob)

                this.arrayBuffer = await blob.arrayBuffer()
                this._uploadFile()
              }
            }
          }

          createRecorder()
          this.mediaRecorder.onstop = async () => {
            this.isRecording = false
            if (!this.isFinished) {
              createRecorder()
              this.mediaRecorder.start()
              this.timerTwo = setTimeout(() => this.mediaRecorder.stop(), 60_000)
            }
          }
          this.mediaRecorder.start()
          this.timerOne = setTimeout(() => this.mediaRecorder.stop(), 60_000)
        }
      } catch (err) {
        this.getCameraErrorMessage(err)
      }
    },
    _stopCameraAndFinishVideo(isFinished = false, callback = null) {
      this.finishCallback = callback
      this.isFinished = isFinished
      clearTimeout(this.timerOne)
      clearTimeout(this.timerTwo)
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop()
      }
      if (this.videoRef?.srcObject) {
        let tracks = this.videoRef.srcObject.getTracks()
        tracks.forEach((track) => track.stop())
        this.videoRef.srcObject = null
      }
    },
    getCameraErrorMessage(err) {
      let message = ''
      switch (err.name) {
        case 'NotAllowedError':
          message = 'Foydalanuvchi kameraga ruxsat bermadi ❌'
          break
        case 'NotFoundError':
          message = 'Kamera qurilmasi topilmadi 📷'
          break
        case 'NotReadableError':
          message = 'Kamera boshqa dastur tomonidan band 🔒'
          break
        case 'OverconstrainedError':
          message = 'Kamera so‘rov parametrlari noto‘g‘ri ⚠️'
          break
        case 'NotSupportedError':
          message = 'Brauzer MediaRecorder’ni qo‘llab-quvvatlamaydi 🛑'
          break
        default:
          message = `Noma’lum xato: ${err.message || err}`
          break
      }

      $Toast.warning(message + ' \n' + err.name)
    },
    async checkUserMediaDevice(callback) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        stream.getTracks().forEach((track) => track.stop())
        callback?.()
      } catch (error) {
        this.getCameraErrorMessage(error)
      }
    },
    startCanvasDraw() {
      const ctx = this.canvasRef.getContext('2d')
      if (this.videoRef.readyState >= 2) {
        ctx.scale(-1, 1)
        ctx.drawImage(
          this.videoRef,
          -this.canvasRef.width,
          0,
          this.canvasRef.width,
          this.canvasRef.height
        )
      }
      this.animationFrameId = requestAnimationFrame(this.startCanvasDraw)
      this.showCanvas = true
    },
    stopCanvasRender() {
      this.showCanvas = false
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
    },
    downloadBlob(blob, filename = `video-${Date.now()}.webm`) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }
})
