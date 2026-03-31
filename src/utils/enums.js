import {
  CheckmarkCircle24Regular,
  ErrorCircle24Regular,
  Info24Regular,
  Warning24Regular
} from '@vicons/fluent'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

export const notificationTypes = {
  info: {
    value: 'info',
    label: t('notification.status.info'),
    icon: markRaw(Info24Regular)
  },
  success: {
    value: 'success',
    label: t('notification.status.success'),
    icon: markRaw(CheckmarkCircle24Regular)
  },
  warning: {
    value: 'warning',
    label: t('notification.status.warning'),
    icon: markRaw(Warning24Regular)
  },
  error: {
    value: 'error',
    label: t('notification.status.error'),
    icon: markRaw(ErrorCircle24Regular)
  }
}

export const getOneMonthAgoYearMonth = (date = null) => {
  const d = new Date(date || new Date())

  const year = d.getFullYear()
  const month = d.getMonth() // 0-11

  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year

  return {
    year: prevYear,
    month: prevMonth + 1 // 1-12
  }
}
