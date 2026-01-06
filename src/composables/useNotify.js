import { ref, markRaw } from 'vue'

const notifications = ref([])
import { Info16Regular } from '@vicons/fluent'

const icons = {
  success: markRaw(Info16Regular),
  danger: markRaw(Info16Regular),
  warning: markRaw(Info16Regular),
  info: markRaw(Info16Regular),
  primary: markRaw(Info16Regular)
}

let id = 0

export const useNotify = () => {
  const notify = (title, message = null, type = 'success', duration = 5000) => {
    const item = {
      id: id++,
      type,
      message,
      title,
      icon: icons[type],
      show: true
    }

    notifications.value.push(item)

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
  const info = (msg, duration) => notify(msg, 'primary', duration)
  const clear = () => {
    notifications.value = []
  }

  return { notifications, notify, success, error, warning, info, remove, clear }
}
