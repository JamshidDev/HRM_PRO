<script setup>
  import ChipWallet from '@/assets/icons/accDashboard/chip-wallet.svg'
  import ChipNotes from '@/assets/icons/accDashboard/chip-notes.svg'
  import ChipFile from '@/assets/icons/accDashboard/chip-file.svg'
  import ChipBank from '@/assets/icons/accDashboard/chip-bank.svg'
  import MarkWallet from '@/assets/icons/accDashboard/wm-wallet.svg'
  import MarkNotes from '@/assets/icons/accDashboard/wm-notes.svg'
  import MarkFile from '@/assets/icons/accDashboard/wm-file.svg'
  import MarkBank from '@/assets/icons/accDashboard/wm-bank.svg'
  import TrendValue from './TrendValue.vue'
  import { toMln } from '../format.js'
  import i18n from '@/i18n/index.js'

  const props = defineProps({
    // `accDashboardStore.kpiCards` elementi
    data: {
      type: Object,
      required: true
    }
  })

  // Maketdagi to'rtta karta: chip foni, 20px ikonka va o'ng yuqoridagi 64px suv belgisi.
  const VARIANTS = {
    salary_fund: { tint: 'bg-fig-blue-100', icon: ChipWallet, mark: MarkWallet },
    tax_four: { tint: 'bg-fig-amber-100', icon: ChipNotes, mark: MarkNotes },
    tax_five: { tint: 'bg-fig-indigo-100', icon: ChipFile, mark: MarkFile },
    pension: { tint: 'bg-fig-green-100', icon: ChipBank, mark: MarkBank }
  }

  const variant = computed(() => VARIANTS[props.data.variant] || VARIANTS.salary_fund)

  // Qo'shimcha qatorda maketdagi qisqa nom turadi, tarjimasi bo'lmasa to'liq nomga tushamiz.
  const extraLabel = computed(() => {
    const key = props.data.extraKey
    if (!key) return null
    const short = `accDashboard.short.${key}`
    return i18n.global.te(short) ? short : `accDashboard.chart.${key}`
  })
</script>

<template>
  <div
    class="relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl bg-fig-block px-1 pt-1.5 pb-1"
  >
    <!-- o'ng yuqoridagi xira suv belgisi: 64px ramka, ikonka o'z o'lchamida markazda -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute top-3 right-3 flex h-16 w-16 items-center justify-center select-none"
    >
      <component :is="variant.mark" />
    </span>

    <div class="relative flex items-center gap-2 px-2">
      <span class="shrink-0 rounded-full p-1" :class="variant.tint">
        <span class="flex h-5 w-5 items-center justify-center">
          <component :is="variant.icon" />
        </span>
      </span>
      <p class="truncate text-[14px] leading-[18px] font-medium text-fig-text-tertiary">
        {{ $t(data.titleKey) }}
      </p>
    </div>

    <p class="relative px-2 whitespace-nowrap">
      <span class="text-[20px] leading-[26px] font-semibold text-fig-text-primary">
        {{ toMln(data.value) }}
      </span>
      <span class="text-[12px] leading-4 text-fig-text-tertiary">
        {{ $t('content.mln') }} {{ $t('content.sum') }}
      </span>
    </p>

    <!-- `mt-auto` — qo'shni karta balandroq bo'lsa ham panel pastda qoladi -->
    <div class="mt-auto flex flex-col gap-1.5 rounded-xl bg-fig-bg-secondary px-3 py-1.5">
      <div class="flex items-start justify-between gap-2">
        <p class="min-w-0 flex-1 text-[12px] leading-4 text-fig-text-tertiary">
          {{ $t('accDashboard.card.prev_month') }}
        </p>
        <TrendValue :delta="data.delta" />
      </div>

      <template v-if="extraLabel">
        <span class="h-px w-full rounded-full bg-fig-br-disable"></span>
        <div class="flex items-start justify-between gap-2">
          <p class="min-w-0 flex-1 text-[12px] leading-4 text-fig-text-tertiary line-clamp-2">
            {{ $t(extraLabel) }}
          </p>
          <p
            class="shrink-0 text-right text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary"
          >
            {{ toMln(data.extraValue) }} {{ $t('content.mln') }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
