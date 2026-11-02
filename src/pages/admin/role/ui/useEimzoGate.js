// Rollar sahifasi: iqtisod bo'limi E-IMZO tasdig'i (yoqish + rollarni ozod qilish), faqat Admin.
import axios from '@/service/index.js'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

const available = ref(false)
const enabled = ref(true)
const settingsLoading = ref(false)
const exemptById = ref({})
const savingId = ref(null)

const load = async () => {
  try {
    const [settings, roles] = await Promise.all([
      axios.get('/v1/eimzo-gate/admin/settings', { silentError: true }),
      axios.get('/v1/eimzo-gate/admin/exempt-roles', { silentError: true })
    ])
    enabled.value = !!settings.data?.data?.enabled
    const map = {}
    for (const r of roles.data?.data ?? []) map[r.id] = { exempt: !!r.exempt, locked: !!r.locked }
    exemptById.value = map
    available.value = true
  } catch {
    // Admin bo'lmagan foydalanuvchi (403) — karta va ustun ko'rsatilmaydi.
    available.value = false
  }
}

const setEnabled = async (value) => {
  settingsLoading.value = true
  try {
    const res = await axios.put(
      '/v1/eimzo-gate/admin/settings',
      { enabled: value },
      { silentSuccess: true }
    )
    enabled.value = !!res.data?.data?.enabled
    $Toast.success(
      t(enabled.value ? 'eimzoGateAdmin.enabledToast' : 'eimzoGateAdmin.disabledToast')
    )
  } finally {
    settingsLoading.value = false
  }
}

const setExempt = async (roleId, value) => {
  savingId.value = roleId
  try {
    await axios.put(
      `/v1/eimzo-gate/admin/exempt-roles/${roleId}`,
      { exempt: value },
      { silentSuccess: true }
    )
    exemptById.value = { ...exemptById.value, [roleId]: { exempt: value, locked: false } }
    $Toast.success(t(value ? 'eimzoGateAdmin.exemptOnToast' : 'eimzoGateAdmin.exemptOffToast'))
  } finally {
    savingId.value = null
  }
}

const exemptCount = computed(
  () => Object.values(exemptById.value).filter((r) => r.exempt).length
)

export const useEimzoGate = () => ({
  available,
  enabled,
  settingsLoading,
  exemptById,
  savingId,
  exemptCount,
  load,
  setEnabled,
  setExempt
})
