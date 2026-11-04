import Utils from '@/utils/Utils.js'

// Ro'yxatdagi bo'sh qatorlar yuborilmaydi (asosiy maydoni bo'sh bo'lsa).
const filled = (rows, key) => (rows ?? []).filter((r) => String(r?.[key] ?? '').trim() !== '')

// Xodim hujjatlari turlari: bo'sh `data`, majburiy maydonlar, raqam talabi, yuborish/tiklash (forma bloki — Form.vue da).
export const DOCUMENT_TYPES = {
  'material-liability': {
    label: 'materialLiabilityPage.name',
    numberRequired: true,
    emptyData: () => ({
      assets: null,
      work_description: null,
      worker_obligations: null,
      employer_obligations: null
    }),
    requiredData: ['assets']
  },
  bitim: {
    label: 'employeeDocumentsPage.types.bitim',
    numberRequired: false,
    emptyData: () => ({ basis: 'ustav', extra_conditions: null }),
    requiredData: ['basis']
  },
  declaration: {
    label: 'employeeDocumentsPage.types.declaration',
    numberRequired: false,
    emptyData: () => ({
      reason: null,
      passport_info: null,
      worker_pin: null,
      relatives: [],
      worker_companies: [],
      relative_companies: [],
      conflict_info: null,
      additional_info: null,
      registry_date: null,
      registry_number: null
    }),
    requiredData: ['reason'],
    toPayload: (d) => ({
      ...d,
      relatives: filled(d.relatives, 'full_name'),
      worker_companies: filled(d.worker_companies, 'name'),
      relative_companies: filled(d.relative_companies, 'name'),
      registry_date: Utils.timeToZone(d.registry_date) || undefined
    }),
    fromForm: (d) => ({
      ...d,
      registry_date: d.registry_date ? new Date(d.registry_date).getTime() : null
    })
  }
}

export const documentTypeOptions = (t) =>
  Object.entries(DOCUMENT_TYPES).map(([id, v]) => ({ id, name: t(v.label) }))
