import { ref } from 'vue'

const notifications = ref([])
let id = 0

export const useNotify = () => {
  const notify = (content, type = 'success', options = { duration: 5000, persistent: false }) => {
    id++
    const { duration } = options
    const item = {
      id,
      type,
      content,
      meta: options?.meta
    }

    notifications.value.push(item)
    if (options?.persistent) return
    if (duration > 0) {
      setTimeout(() => remove(item.id), duration)
    }
  }

  const remove = (id) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) notifications.value.splice(index, 1)
  }

  const success = (msg, duration) => notify(msg, 'success', duration)
  const error = (msg, duration) => notify(msg, 'danger', duration)
  const warning = (msg, duration) => notify(msg, 'warning', duration)
  const info = (msg, duration) => notify(msg, 'info', duration)
  const clear = () => {
    notifications.value = []
  }

  return { notifications, notify, success, error, warning, info, remove, clear }
}
