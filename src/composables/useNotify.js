
import { ref, markRaw} from 'vue'

const notifications = ref([])
import {Info20Filled} from "@vicons/fluent"

const icons = {
    success:markRaw(Info20Filled),
    danger:markRaw(Info20Filled),
    warning:markRaw(Info20Filled),
    info:markRaw(Info20Filled),
    primary:markRaw(Info20Filled),
}

let id = 0

export const useNotify = () => {
    const notify = (title,message=null, type = 'success', duration = 25000) => {
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
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) notifications.value.splice(index, 1)
    }

    const success = (msg, duration) => notify(msg, 'success', duration)
    const error = (msg, duration) => notify(msg, 'danger', duration)
    const warning = (msg, duration) => notify(msg, 'warning', duration)
    const info = (msg, duration) => notify(msg, 'primary', duration)
    const clear = () => { notifications.value = [] }

    return { notifications, notify, success, error, warning, info, remove, clear }
}