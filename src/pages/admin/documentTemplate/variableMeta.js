import i18n from '@/i18n/index.js'

/**
 * Shablon o'zgaruvchilarining guruhi va o'qiladigan nomi.
 *
 * Nom `documentTemplate.vars.<name>` i18n kalitidan olinadi. Lug'atda yo'q
 * o'zgaruvchi (backend yangisini qo'shsa) ham ko'rinadi — nomi o'rniga
 * `${name}` ning o'zi, guruhi esa prefiks bo'yicha taxmin qilinadi.
 */

export const VARIABLE_GROUPS = ['organization', 'worker', 'document', 'terms', 'other']

// Prefiks → guruh. Tartib muhim: birinchi mos kelgani olinadi.
const PREFIX_GROUPS = [
  [/^(organization|director|city)/, 'organization'],
  [/^(worker|new_department|new_position|department|position)/, 'worker'],
  [/^(document|contract|additional|command|application)/, 'document'],
  [/(salary|rate|vacation|probation|schedule|dismissal|start_date|change_date)/, 'terms']
]

export const variableGroup = (name) =>
  PREFIX_GROUPS.find(([re]) => re.test(name))?.[1] ?? 'other'

export const variableLabel = (name) => {
  const key = `documentTemplate.vars.${name}`
  return i18n.global.te(key) ? i18n.global.t(key) : null
}

export const groupLabel = (group) => i18n.global.t(`documentTemplate.groups.${group}`)

// Hujjat matnidagi `${...}` lar — nom bo'yicha necha marta uchragani.
const VARIABLE_RE = /\$\{([^{}\s]+)\}/g

export const extractVariables = (texts) => {
  const counts = new Map()
  for (const text of texts) {
    for (const [, name] of text.matchAll(VARIABLE_RE)) {
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  return counts
}
