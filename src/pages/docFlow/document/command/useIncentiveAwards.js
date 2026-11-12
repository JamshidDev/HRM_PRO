// Rag'batlantirish mukofot turlari (ichki turlar + davlat mukofotlari) — 71 yaratish va ro'yxatdan o'tkazish uchun umumiy.
import i18n from '@/i18n/index.js'

// «Boshqa» — mukofot nomi qo'lda yoziladi (backend OTHER_AWARD_ID).
export const OTHER_AWARD_ID = 105
// Davlat mukofotlari uchun gift_type (backend STATE_AWARD_GIFT_TYPE).
const STATE_AWARD_GIFT_TYPE = 7
const GROUPS = ['other', 'title', 'order', 'medal', 'honorary']

const awards = ref([])
const loading = ref(false)
let request = null

const load = () => {
  if (awards.value.length) return Promise.resolve()
  if (request) return request
  loading.value = true
  request = $ApiService.commandService
    ._legacyAwards()
    .then((res) => (awards.value = res.data.data || []))
    .finally(() => {
      loading.value = false
      request = null
    })
  return request
}

// Eski gift_type (1–5 ichki tur, 6 «Shuhrat» medali) → mukofot id.
export const awardIdFromGiftType = (giftType) => {
  const gt = Number(giftType)
  if (gt >= 1 && gt <= 5) return 100 + gt
  if (gt === 6) return 44
  return null
}

export function useIncentiveAwards() {
  const { t } = i18n.global
  const options = computed(() =>
    GROUPS.map((g) => ({
      type: 'group',
      key: g,
      label: t(`commandPage.legacy.awardGroups.${g}`),
      children: awards.value
        .filter((a) => a.group === g)
        .map((a) => ({ label: a.name, value: a.id }))
    })).filter((g) => g.children.length)
  )
  const byId = (id) => awards.value.find((a) => a.id === id)
  // Tanlangan mukofot → gift_type va hujjatdagi nomi.
  const fieldsOf = (awardId, customName) => {
    const a = byId(awardId)
    if (!a) return null
    return {
      award_id: a.id,
      gift_type: a.gift_type ?? STATE_AWARD_GIFT_TYPE,
      gift: a.id === OTHER_AWARD_ID ? (customName || '').trim() : a.name
    }
  }
  return { awards, loading, options, load, fieldsOf }
}
