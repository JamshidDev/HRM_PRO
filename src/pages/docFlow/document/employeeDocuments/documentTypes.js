// Xodim hujjatlari turlari: bo'sh `data`, majburiy maydonlar, raqam talabi (forma bloki — Form.vue da).
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
  }
}

export const documentTypeOptions = (t) =>
  Object.entries(DOCUMENT_TYPES).map(([id, v]) => ({ id, name: t(v.label) }))
