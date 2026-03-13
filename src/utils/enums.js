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
  date = date || new Date()
  const d = new Date(date)
  d.setMonth(d.getMonth() - 1)
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1 // 1- 12
  }
}
