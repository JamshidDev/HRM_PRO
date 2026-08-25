<script setup>
  /**
   * Figma v3 · Tab 1 "Tug'ilgan kunlar" (node 2966:68947).
   *
   * Birinchi qator (bugungi kun) ko'k to'ldirilgan blok bo'lib ajralib turadi,
   * qolganlari `bg-secondary` ro'yxatda 1px ajratgichlar bilan ketadi. Soni
   * nol bo'lgan kun `bg-disable` fonda kulrang chiziladi.
   */
  import { UIUserGroup } from '@/components/index.js'
  import HeadPartyHorn from '@/assets/icons/hrmDashboard/head-party-horn.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'

  defineEmits(['detail'])

  const store = useDashboardStore()
  const { t } = i18n.global

  const isMock = computed(() => store.isMock('overview', 'birthdays'))

  /** Backend `MM-DD` beradi — maketda "03 - Avgust" ko'rinishida chiziladi. */
  const formatDay = (value) => {
    const [month, day] = String(value || '').split('-')
    return `${day} - ${Utils.getMonthNameByKey(month)}`
  }

  // `n-avatar-group` `max` katakning oxirgisini "+N" ga beradi, ya'ni ko'rinadigan
  // avatarlar soni `AVATAR_MAX - 1` ta bo'ladi.
  const AVATAR_MAX = 3
  const AVATAR_SHOWN = AVATAR_MAX - 1

  const items = computed(() => {
    // Maketda birinchi ikki qatorda "Bugungi / Ertangi tug'ilgan kunlar" izohi
    // bor, qolganlarida faqat sana turadi.
    const labels = [t('dashboardPage.birthday.today'), t('dashboardPage.birthday.tomorrow')]
    return (store.overview.birthdays?.result || []).map((item, idx) => {
      const total = Number(item.count) || 0
      // Backend preview ro'yxatini qaytaradi — undan faqat sig'adigani chiziladi.
      const shown = (item.workers || []).slice(0, AVATAR_SHOWN)
      const rest = Math.max(total - shown.length, 0)

      return {
        day: formatDay(item.day),
        label: labels[idx] || null,
        total,
        has_more: item.has_more,
        rest,
        // `UIUserGroup` "+N" ni faqat ro'yxat `max` dan uzun bo'lsagina chizadi.
        // Ortiqcha kataklar chizilmaydi, shuning uchun bo'sh joy-egallovchi
        // bilan to'ldiriladi — avval bu yerda ro'yxat ikki karra qilinib,
        // bitta odam rasmi ikki marta ustma-ust tushib qolayotgan edi.
        workers:
          rest > 0
            ? [...shown, ...Array.from({ length: AVATAR_MAX + 1 - shown.length }, () => ({}))]
            : shown
      }
    })
  })

  const head = computed(() => items.value[0] || null)
  const tail = computed(() => items.value.slice(1))

  // Maketda soni ro'yxatga sig'maganda "154+" ko'rinishida yoziladi.
  const countLabel = (item) => (item.has_more ? `${item.total}+` : String(item.total ?? 0))

  const avatars = (item) =>
    (item.workers || []).map((w) => ({
      photo: w.photo,
      fullName: [w.last_name, w.first_name].filter(Boolean).join(' ')
    }))
</script>

<template>
  <FigPanel
    muted
    tint="none"
    :icon="HeadPartyHorn"
    :title="$t('dashboardPage.birthday.title')"
    :action-text="$t('content.detail')"
    :mock="isMock"
    :inner="false"
    @action="$emit('detail')"
  >
    <div class="flex min-h-px flex-1 flex-col gap-2">
      <div v-if="head" class="flex items-center gap-2 rounded-xl bg-fig-brand px-3 py-3.5">
        <div class="flex min-w-0 flex-1 flex-col justify-center gap-1 text-[12px] leading-4 text-white">
          <p class="truncate font-semibold">{{ head.day }}</p>
          <p v-if="head.label" class="truncate font-normal">{{ head.label }}</p>
        </div>
        <p class="shrink-0 text-right text-[12px] leading-4 font-semibold whitespace-nowrap text-white">
          {{ countLabel(head) }}
        </p>
        <UIUserGroup
          v-if="head.workers?.length"
          class="birthday-avatars"
          :size="28"
          :max="AVATAR_MAX"
          :has-more="head.rest"
          :data="avatars(head)"
        />
      </div>

      <div class="flex min-h-px flex-1 flex-col rounded-xl bg-fig-bg-secondary py-1.5">
        <template v-for="(item, idx) in tail" :key="idx">
          <span v-if="idx" class="mr-[86px] ml-3 h-px bg-fig-br-disable"></span>
          <div
            class="flex min-h-px flex-1 items-center gap-2 px-3 py-2"
            :class="!item.total && 'bg-fig-bg-disable'"
          >
            <div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <p class="truncate text-[12px] leading-4 text-fig-text-primary">{{ item.day }}</p>
              <p v-if="item.label" class="truncate text-[12px] leading-4 text-fig-text-primary">
                {{ item.label }}
              </p>
            </div>
            <p
              class="shrink-0 text-right text-[12px] leading-4 font-semibold whitespace-nowrap"
              :class="item.total ? 'text-fig-text-green' : 'text-fig-text-disable'"
            >
              {{ countLabel(item) }}
            </p>
            <UIUserGroup
              v-if="item.workers?.length"
              class="birthday-avatars"
              :size="28"
              :max="AVATAR_MAX"
              :has-more="item.rest"
              :data="avatars(item)"
            />
            <!-- maketda bo'sh kunda ham uchta kulrang doira turadi -->
            <div v-else class="flex shrink-0 items-center">
              <span
                v-for="n in 3"
                :key="n"
                class="-mr-2 h-7 w-7 rounded-full border border-fig-bg-disable bg-fig-br-disable last:mr-0"
              ></span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </FigPanel>
</template>

<style scoped>
  /* Maketda avatarlar 28×28, oq halqali va 8px ustma-ust tushadi. Global
     `.ui__user-group` rasmni 36×42 qilib beradi — bu yerda kvadratga qaytariladi,
     aks holda qo'shni avatar ostiga chiqib ketadi. */
  .birthday-avatars :deep(.ui__user-group > img) {
    width: 28px !important;
    height: 28px !important;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }

  .birthday-avatars :deep(.n-avatar-group) {
    --n-gap: -8px !important;
  }

  .birthday-avatars :deep(.n-avatar) {
    border: 1px solid #ffffff;
  }
</style>
