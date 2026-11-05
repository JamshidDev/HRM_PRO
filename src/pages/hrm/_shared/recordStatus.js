import Utils from '@/utils/Utils.js'

export const RECORD_STATUS = { active: 1, expired: 2, cancelled: 3 }

// Mukofotda status boolean keladi (false = bekor qilingan) — raqamga keltiriladi.
export const normalizeStatus = (v) => {
  if (v === false) return RECORD_STATUS.cancelled
  if (v === true || v == null) return RECORD_STATUS.active
  return Number(v)
}

export const recordStatusMeta = (v) => {
  const id = normalizeStatus(v)
  if (id === RECORD_STATUS.expired)
    return { id, label: 'incentive.status.expired', type: Utils.colorTypes.secondary }
  if (id === RECORD_STATUS.cancelled)
    return { id, label: 'incentive.status.cancelled', type: Utils.colorTypes.error }
  return { id, label: 'incentive.status.active', type: Utils.colorTypes.success }
}

export const recordStatusOptions = (t, withExpired) =>
  [
    { id: RECORD_STATUS.active, name: t('incentive.status.active') },
    withExpired && { id: RECORD_STATUS.expired, name: t('incentive.status.expired') },
    { id: RECORD_STATUS.cancelled, name: t('incentive.status.cancelled') }
  ].filter(Boolean)
