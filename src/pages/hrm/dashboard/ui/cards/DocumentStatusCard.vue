<script setup>
  /**
   * Pasport / tibbiy ko'rik / pensiya muddatlari kartasi.
   *
   * Maketda alohida bloki yo'q — Figma v3 KPI kartasining (node 2959:58231)
   * "sarlavha + qiymat + `bg-secondary` ma'lumot bloki" tuzilishi qayta
   * ishlatilgan, ustiga panel sarlavhasidagi "Batafsil ↗" havolasi qo'shilgan.
   */
  import FigIdCard from '@/assets/icons/figIdCard.svg'
  import HeadMedicalFile from '@/assets/icons/hrmDashboard/head-medical-file.svg'
  import ChipUserAlt from '@/assets/icons/hrmDashboard/chip-user-alt.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { InfoCardEnum } from '../../constants.js'
  import Utils from '@/utils/Utils.js'

  const props = defineProps({
    type: {
      type: String,
      required: true // 'passport' | 'med' | 'pension'
    }
  })

  const emit = defineEmits(['detail'])

  const store = useDashboardStore()

  const VARIANTS = {
    passport: {
      tint: 'blue',
      // `figIdCard` loyihaning o'z ikonkasi: `currentColor` bilan bo'yaladi va
      // eksport qilingan chiplardan farqli o'laroq svg'da o'lchami yo'q, shuning
      // uchun maketdagi 20px ramkaga aniq o'lcham berib qo'yiladi.
      icon: FigIdCard,
      iconClass: 'text-fig-brand [&>svg]:h-5 [&>svg]:w-5',
      titleKey: 'dashboardPage.password.title',
      source: () => [
        { title: 'dashboardPage.password.deadline', count: store.legacy.passports_count },
        { title: 'dashboardPage.password.expired', count: store.legacy.passports_more_count }
      ],
      key: InfoCardEnum.PASSPORT
    },
    med: {
      tint: 'red',
      icon: HeadMedicalFile,
      iconClass: '',
      titleKey: 'dashboardPage.medical.title',
      source: () => [
        { title: 'dashboardPage.medical.deadline', count: store.legacy.meds_approaching },
        { title: 'dashboardPage.medical.expired', count: store.legacy.meds_finished }
      ],
      key: InfoCardEnum.MED
    },
    pension: {
      tint: 'amber',
      icon: ChipUserAlt,
      iconClass: '',
      titleKey: 'dashboardPage.pension.title',
      source: () => [
        {
          title: 'dashboardPage.pension.men',
          count: store.overview.kpi?.pension_age?.male
        },
        {
          title: 'dashboardPage.pension.women',
          count: store.overview.kpi?.pension_age?.female
        }
      ],
      key: InfoCardEnum.PENSION
    }
  }

  const variant = computed(() => VARIANTS[props.type])
  const rows = computed(() => variant.value.source().filter((row) => row.count !== undefined))
  const total = computed(() => rows.value.reduce((sum, row) => sum + (row.count ?? 0), 0))

  const format = (value) => Utils.formatNumberToMoney(value) || String(value ?? 0)
</script>

<template>
  <FigPanel
    muted
    :tint="variant.tint"
    :icon="variant.icon"
    :title="$t(variant.titleKey)"
    :action-text="$t('content.detail')"
    :inner="false"
    :icon-class="variant.iconClass"
    @action="emit('detail', variant.key)"
  >
    <p class="px-2 pb-2 text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary">
      {{ format(total) }}
    </p>

    <div class="mt-auto flex flex-col gap-1.5 rounded-xl bg-fig-bg-secondary px-3 py-1.5">
      <template v-for="(row, idx) in rows" :key="idx">
        <span v-if="idx" class="h-px w-full rounded-full bg-fig-br-disable"></span>
        <div class="flex items-start justify-between gap-2">
          <p class="min-w-0 flex-1 text-[12px] leading-4 text-fig-text-tertiary">
            {{ $t(row.title) }}
          </p>
          <p
            class="shrink-0 text-right text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary"
          >
            {{ format(row.count) }}
          </p>
        </div>
      </template>
    </div>
  </FigPanel>
</template>
