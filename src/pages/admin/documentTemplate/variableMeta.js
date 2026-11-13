import i18n from '@/i18n/index.js'

// Panel guruhlari tartibi; nom va tavsif backend lug'atidan keladi.
export const VARIABLE_GROUPS = ['organization', 'worker', 'document', 'terms', 'other']

export const groupLabel = (group) => i18n.global.t(`documentTemplate.groups.${group}`)
