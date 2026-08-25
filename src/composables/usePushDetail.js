// Push toast'i bosilganda ochiladigan modal holati (global, bitta nusxa).
import { ref } from 'vue'

const visible = ref(false)
const detail = ref(null)

export const usePushDetail = () => {
  const open = (payload) => {
    detail.value = payload
    visible.value = true
  }
  const close = () => {
    visible.value = false
  }
  return { visible, detail, open, close }
}
