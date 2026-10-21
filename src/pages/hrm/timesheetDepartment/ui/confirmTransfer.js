import i18n from '@/i18n/index.js'
import { showAlert } from '@/components/notify/alertDialog.js'
import { useTimesheetDepartmentStore } from '@/store/modules/index.js'

const { t } = i18n.global
const holder = (k) => [k.last_name, k.first_name, k.middle_name].filter(Boolean).join(' ')

// Boshqa tabelchidagi bo'lim tanlangan bo'lsa — Alert'da tasdiqlangandan keyingina biriktiriladi.
export function confirmTransfer(save) {
  const store = useTimesheetDepartmentStore()
  if (!store.transferConflicts.length) return save(false)
  showAlert({
    type: 'warning',
    title: t('timesheetWorkerPage.transfer_title'),
    message: t('timesheetWorkerPage.transfer_hint', { to: store.targetWorkerName || '—' }),
    errors: store.transferConflicts.map((d) =>
      t('timesheetWorkerPage.transfer_item', { department: d.name, from: d.others.map(holder).join(', ') })
    ),
    listHint: '',
    confirmText: t('timesheetWorkerPage.transfer_confirm'),
    onConfirm: () => save(true)
  })
}
