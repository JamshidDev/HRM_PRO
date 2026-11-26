// Rol doirasi: kesim (korxona | bo'linma) + doira turi; API bilan moslash shu yerda.

import { PERMISSION_GROUPS } from '@/utils/permissionGroups.js'

export const SCOPE_LEVELS = ['organization', 'department']

// Kesim bo'yicha ruxsat etilgan doira turlari (birinchisi — standart).
export const SCOPE_TYPES = {
  organization: ['single', 'subtree', 'all'],
  department: ['selected']
}

export const defaultScopeType = (level) => SCOPE_TYPES[level]?.[0] ?? null

// Faqat Admin beradigan doiralar.
export const isAdminOnlyScope = (level, type) =>
  level === 'organization' && (type === 'all' || type === 'subtree')

// Bo'linma kesimida ruxsat etilgan guruh prefikslari (backend `dept_scoped` kelguncha).
// Manba: NestJS'da bo'linma doirasini qo'llaydigan endpoint'lar + menyu/modul-kirish slug'lari (2026-11-20 tahlili).
export const DEPT_SCOPED_PREFIXES = new Set([
  'confirmation',
  'confirmation-commands',
  'confirmation-contract-additional',
  'confirmation-contracts',
  'confirmation-lms-certificate',
  'confirmation-staffing-approval',
  'confirmation-table',
  'confirmation-worker-applications',
  'educations-structure-menu',
  'extra',
  'hr',
  'hr-archive',
  'hr-business-trip',
  'hr-certificates',
  'hr-commands',
  'hr-contract-additional',
  'hr-contracts',
  'hr-dashboard',
  'hr-departments',
  'hr-discips',
  'hr-edu-plans',
  'hr-incentives',
  'hr-med',
  'hr-positions',
  'hr-report',
  'hr-table-workers',
  'hr-users',
  'hr-vacation-schedule',
  'hr-vacations',
  'hr-worker-applications',
  'hr-workers',
  'profile-activity',
  'turnstile',
  'turnstile-access-levels',
  'turnstile-dashboard',
  'turnstile-hik-central-job',
  'turnstile-hik-central-tg-user',
  'turnstile-hik-central-workers',
  'turnstile-others',
  'turnstile-schedule',
  'turnstile-sheets',
  'turnstile-work-duration',
  'turnstile-worker-image',
  'useful',
  'mobile-services'
])

export const isDeptScopedGroup = (prefix) => DEPT_SCOPED_PREFIXES.has(prefix)

// Ruxsat slug'i → guruh prefiksi (sanctum guruhlari bo'yicha).
const SLUG_PREFIX = new Map()
const SANCTUM_PREFIXES = []
for (const mod of PERMISSION_GROUPS) {
  if ((mod.guard ?? 'sanctum') !== 'sanctum') continue
  for (const g of mod.groups) {
    SANCTUM_PREFIXES.push(g.prefix)
    for (const s of [g.prefix, `${g.prefix}-read`, `${g.prefix}-write`, `${g.prefix}-delete`])
      if (!SLUG_PREFIX.has(s)) SLUG_PREFIX.set(s, g.prefix)
    for (const a of g.actions ?? []) if (!SLUG_PREFIX.has(a.slug)) SLUG_PREFIX.set(a.slug, g.prefix)
  }
}
SANCTUM_PREFIXES.sort((a, b) => b.length - a.length)

export function permissionGroupPrefix(slug) {
  if (SLUG_PREFIX.has(slug)) return SLUG_PREFIX.get(slug)
  return SANCTUM_PREFIXES.find((p) => slug.startsWith(`${p}-`)) ?? null
}

// Hozirgi backend bo'linma doirasini shu ruxsat orqali aniqlaydi; kesim bilan avtomatik boshqariladi.
export const DEPT_SCOPE_PERMISSION = 'scope-departments'

// Guruhga tushmagan ruxsat ham bo'linma kesimida ruxsat etilmaydi (xavfsiz tomon).
export const isDeptScopedPermission = (slug) => {
  if (slug === DEPT_SCOPE_PERMISSION) return true
  const prefix = permissionGroupPrefix(slug)
  return prefix != null && isDeptScopedGroup(prefix)
}

// Kesimga qarab `scope-departments` ruxsatini qo'shadi yoki olib tashlaydi.
export function syncDeptScopePermission(permissionIds, level, allPermissions) {
  const id = (allPermissions || []).find((p) => p.name === DEPT_SCOPE_PERMISSION)?.id
  if (id == null) return permissionIds
  const rest = permissionIds.filter((x) => x !== id)
  return level === 'department' ? [...rest, id] : rest
}

// Backend scope_level qaytarguncha bo'linma rollari shu kalitlar bo'yicha aniqlanadi.
const LEGACY_DEPARTMENT_KEYS = ['HRAsistent', 'onlyViewer', 'TimesheetHR']

// API qatori → forma maydonlari.
export function fromApiRole(row) {
  const key = row.key ?? row.name
  // `scope-departments` ruxsati bor rol — bo'linma kesimi (hozirgi backend ham shunga qaraydi).
  const hasDeptPermission = (row.permissions ?? []).some((p) => p.name === 'scope-departments')
  const level =
    row.scope_level ??
    (hasDeptPermission || LEGACY_DEPARTMENT_KEYS.includes(key) ? 'department' : 'organization')
  let type = row.scope_kind ?? null
  if (!type) {
    if (level === 'department') type = 'selected'
    else if (row.scope_type === 'all') type = 'all'
    else type = row.scope_type === 'global' ? 'subtree' : 'single'
  }
  return {
    key,
    name: row.display_name ?? row.name,
    scope_level: level,
    scope_type: type
  }
}

// Forma → API. Hozirgi backend `name`ni kalit sifatida va `scope_type`ni local/global sifatida tushunadi.
export function toApiPayload(p) {
  const integration = p.guard_name === 'integration'
  // Backend scope_type: local — o'z korxonasi, global — quyi korxonalar bilan, all — barcha korxonalar.
  const legacyScope = integration
    ? null
    : p.scope_level !== 'organization'
      ? 'local'
      : ({ single: 'local', subtree: 'global', all: 'all' }[p.scope_type] ?? 'local')
  return {
    name: p.key,
    guard_name: p.guard_name,
    scope_type: legacyScope,
    permissions: p.permissions,
    // Yangi kontrakt maydonlari — backend tayyor bo'lganda o'qiladi.
    display_name: p.name,
    scope_level: integration ? null : p.scope_level,
    scope_kind: integration ? null : p.scope_type
  }
}

export const ROLE_KEY_RE = /^[A-Za-z][A-Za-z0-9_-]{1,63}$/

// Kalit xatosi faqat yangi rolda tekshiriladi (mavjud rol kaliti qulflangan).
export const isRoleKeyInvalid = (key, isCreate) => !!(isCreate && key && !ROLE_KEY_RE.test(key))

// 1-qadam to'liqmi: kalit, nom, to'g'ri kalit va hal qilinmagan kesim tasdig'i yo'q.
export const isRoleSettingsValid = (payload, isCreate, pendingLevel) =>
  !!payload.key &&
  !!payload.name?.trim() &&
  !isRoleKeyInvalid(payload.key, isCreate) &&
  !pendingLevel
