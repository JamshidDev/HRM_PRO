import i18n from '@/i18n/index.js'
import { showAlert } from '@/components/notify/alertDialog.js'

const { t } = i18n.global

// Bo'lim bilan beriladigan rollar (xom nomi).
export const HR_ASSISTANT_ROLE = 'HRAsistent'
export const TIMEKEEPER_ROLE = 'TimesheetHR'
export const isDepartmentRole = (role) => role === HR_ASSISTANT_ROLE || role === TIMEKEEPER_ROLE

export const emptyDepartments = () => ({ whole: false, departments: [] })

// Bo'limli rolda kamida bitta bo'lim (yoki HR yordamchisi uchun «butun korxona») shart.
export const departmentsValid = (role, value) =>
  !isDepartmentRole(role) ||
  (role === HR_ASSISTANT_ROLE && value?.whole) ||
  (value?.departments?.length ?? 0) > 0

export const departmentsPayload = (role, value) =>
  isDepartmentRole(role)
    ? {
        whole: role === HR_ASSISTANT_ROLE ? !!value?.whole : false,
        departments: value?.whole && role === HR_ASSISTANT_ROLE ? [] : (value?.departments ?? [])
      }
    : {}

const fullName = (w) => [w?.last_name, w?.first_name, w?.middle_name].filter(Boolean).join(' ')

// Boshqa tabelchidagi bo'limlar: [{ id, name, holders: 'F.I.Sh' }].
export const timekeeperConflicts = (departments, holders, nodes, selfWorkerUuid) =>
  departments
    .map((id) => {
      const others = holders.filter((h) => h.department_id === id && h.worker?.uuid !== selfWorkerUuid)
      if (!others.length) return null
      return { id, name: nodes[id]?.name ?? `#${id}`, holders: others.map((h) => fullName(h.worker)).join(', ') }
    })
    .filter(Boolean)

// Band bo'lim bo'lsa — tasdiqdan keyingina `transfer: true` bilan saqlanadi.
export function confirmTransfer(conflicts, save) {
  if (!conflicts.length) return save(false)
  showAlert({
    type: 'warning',
    title: t('workerRole.dept.transferTitle'),
    message: t('workerRole.dept.transferHint'),
    errors: conflicts.map((c) => `«${c.name}» — ${c.holders}`),
    listHint: '',
    confirmText: t('workerRole.dept.transferConfirm'),
    onConfirm: () => save(true)
  })
}

// Ro'yxatda ko'rsatish: «Butun korxona» yoki bo'lim nomlari.
export const departmentsLabel = (value) =>
  value?.whole
    ? t('workerRole.dept.whole')
    : (value?.departments ?? []).map((d) => d.name).join(', ') || t('workerRole.dept.none')

export const departmentsCount = (value) => (value?.whole ? 0 : (value?.departments?.length ?? 0))
