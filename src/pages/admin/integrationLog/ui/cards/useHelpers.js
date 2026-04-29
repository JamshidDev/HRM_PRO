export const colorMap = {
  primary: { icon: 'bg-primary text-white',  bg: 'bg-primary/10', text: 'text-primary', stroke: '#1A84FF', bar: 'bg-primary/70' },
  success: { icon: 'bg-success text-white',  bg: 'bg-success/10', text: 'text-success', stroke: '#2DCB73', bar: 'bg-success/70' },
  danger:  { icon: 'bg-danger text-white',   bg: 'bg-danger/10',  text: 'text-danger',  stroke: '#E7000A', bar: 'bg-danger/70'  },
  warning: { icon: 'bg-warning text-white',  bg: 'bg-warning/10', text: 'text-warning', stroke: '#FDC700', bar: 'bg-warning/70' },
  info:    { icon: 'bg-info text-white',     bg: 'bg-info/10',    text: 'text-info',    stroke: '#3B82F6', bar: 'bg-info/70'    }
}

export const methodColors = {
  POST: '#1A84FF', GET: '#2DCB73', PUT: '#F59E0B', DELETE: '#E53935', PATCH: '#8B5CF6'
}

export const methodBadgeClass = (method) => {
  const map = {
    GET:    'bg-primary text-white',
    POST:   'bg-warning text-white',
    PUT:    'bg-warning/10 text-warning',
    DELETE: 'bg-danger/10 text-danger',
    PATCH:  'bg-purple-100 text-purple-600'
  }
  return map[method] || 'bg-gray-100 text-gray-500'
}

export const methodBadgeBarClass = (method) => {
  const map = {
    GET: 'bg-success/50', POST: 'bg-primary/50', PUT: 'bg-warning/50', DELETE: 'bg-danger/50', PATCH: 'bg-purple-400/50'
  }
  return map[method] ?? 'bg-gray-300'
}

export const secretTypeBadge = (type) => {
  const map = {
    sanctum:      'bg-primary/10 text-primary',
    bearer:       'bg-warning/10 text-warning',
    user:         'bg-success/10 text-success',
    sanctum_user: 'bg-success/10 text-success',
    mobile_face:  'bg-info/10 text-info'
  }
  return map[type?.toLowerCase()] ?? 'bg-surface-ground text-textColor2'
}

export const statusColor = (code) => {
  if (code === 200)              return { bg: 'bg-success text-white', bar: 'bg-success/70' }
  if (code >= 300 && code < 400) return { bg: 'bg-info text-white',    bar: 'bg-info/70'    }
  if (code >= 400)               return { bg: 'bg-danger text-white',  bar: 'bg-danger/70'  }
  return { bg: 'bg-gray-400 text-white', bar: 'bg-gray-400/70' }
}

export const durationColor = (ms) => {
  if (ms < 200)  return 'text-success'
  if (ms <= 500) return 'text-warning'
  return 'text-danger'
}

export const durationBgClass = (ms) => {
  if (ms < 200)  return 'bg-success/10 text-success'
  if (ms <= 500) return 'bg-warning/10 text-warning'
  return 'bg-danger/10 text-danger'
}

export const errorRate = (errors, total) => {
  if (!total) return '0%'
  return `${((errors / total) * 100).toFixed(1)}%`
}
