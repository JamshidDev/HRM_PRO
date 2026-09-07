import { reactive } from 'vue'
import ApiService from '@/service/ApiService.js'
import Utils from '@/utils/Utils.js'

// Bitta xodimning turniket hodisalarini davr bo'yicha Excelga yuklash.
// Holat modul darajasida — amalni chaqiruvchi (Table) va modal (page) bir xil obyektni ko'radi.
const state = reactive({
  visible: false,
  loading: false,
  worker: null,
  payload: {
    from: null,
    to: null
  }
})

export const useTurnstileDownload = () => {
  const open = (worker) => {
    state.worker = worker
    state.payload.from = null
    state.payload.to = null
    state.visible = true
  }

  // «Hodisalar» sahifasidagi yuklash bilan bir xil endpoint — farqi: xodim qat'iy bitta.
  const submit = (onSuccess) => {
    state.loading = true
    const params = {
      download: true,
      from: Utils.timeToZone(state.payload.from),
      to: Utils.timeToZone(state.payload.to),
      workers: state.worker?.id
    }
    ApiService.eventV2Service
      ._index({ params })
      .then((res) => {
        onSuccess?.()
        window.$message?.success(res.data?.message)
        state.visible = false
      })
      .finally(() => {
        state.loading = false
      })
  }

  return { state, open, submit }
}
