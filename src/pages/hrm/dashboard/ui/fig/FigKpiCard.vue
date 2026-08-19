<script setup>
  /**
   * Figma v3 dashboard KPI kartasi (node 2959:58231).
   *
   * Tuzilishi: tint chip + 20px ikonka, 20px qiymat, o'ng yuqorida 64px xira
   * suv belgisi va pastda 12px radiusli `bg-secondary` blokda "label — qiymat"
   * qatorlari (orasida 1px ajratgich).
   *
   * Maketdagi "o'tgan yilga" trend qatori bu yerda yo'q: backend dashboard
   * javobida o'tgan yil ko'rsatkichi qaytmaydi, shuning uchun qator chizilmaydi.
   */
  import ChipUsers from '@/assets/icons/hrmDashboard/chip-users.svg'
  import ChipUserAlt from '@/assets/icons/hrmDashboard/chip-user-alt.svg'
  import ChipHierarchy from '@/assets/icons/hrmDashboard/chip-hierarchy.svg'
  import ChipAgreement from '@/assets/icons/hrmDashboard/chip-agreement.svg'
  import ChipMedicalFile from '@/assets/icons/hrmDashboard/head-medical-file.svg'
  import MarkUsers from '@/assets/icons/hrmDashboard/wm-users.svg'
  import MarkUserAlt from '@/assets/icons/hrmDashboard/wm-user-alt.svg'
  import MarkHierarchy from '@/assets/icons/hrmDashboard/wm-hierarchy.svg'
  import MarkAgreement from '@/assets/icons/hrmDashboard/wm-agreement.svg'
  import Utils from '@/utils/Utils.js'

  const props = defineProps({
    // `{ total: {title, count}, data1: {title, count}, data2: {title, count} }`
    card: {
      type: Object,
      required: true
    },
    variant: {
      type: String,
      default: 'users'
    }
  })

  // Maketdagi to'rtta karta: chip foni, 20px ikonka va 64px suv belgisi.
  const VARIANTS = {
    users: { tint: 'bg-fig-blue-100', icon: ChipUsers, mark: MarkUsers },
    pension: { tint: 'bg-fig-amber-100', icon: ChipUserAlt, mark: MarkUserAlt },
    positions: { tint: 'bg-fig-indigo-100', icon: ChipHierarchy, mark: MarkHierarchy },
    fxsh: { tint: 'bg-fig-indigo-100', icon: ChipAgreement, mark: MarkAgreement },
    // Davomat tabidagi kartalar maketda ham shu shakl bilan chiziladi
    vacation: { tint: 'bg-fig-amber-100', icon: ChipUserAlt, mark: MarkUserAlt },
    sickLeave: { tint: 'bg-fig-red-100', icon: ChipMedicalFile, mark: null }
  }

  const variant = computed(() => VARIANTS[props.variant] || VARIANTS.users)

  const rows = computed(() => [props.card.data1, props.card.data2].filter(Boolean))

  const format = (value) =>
    value === null || value === undefined ? '—' : Utils.formatNumberToMoney(value) || String(value)
</script>

<template>
  <div
    class="relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl bg-fig-block px-1 pt-1.5 pb-1"
  >
    <!-- o'ng yuqoridagi xira suv belgisi: 64px ramka, ikonka o'z o'lchamida markazda -->
    <span
      v-if="variant.mark"
      aria-hidden="true"
      class="pointer-events-none absolute top-3 right-3 flex h-16 w-16 items-center justify-center select-none"
    >
      <component :is="variant.mark" />
    </span>

    <div class="relative flex items-center gap-1 px-2">
      <span class="shrink-0 rounded-lg p-1" :class="variant.tint">
        <span class="flex h-5 w-5 items-center justify-center">
          <component :is="variant.icon" />
        </span>
      </span>
      <p class="truncate text-[14px] leading-[18px] font-medium text-fig-text-tertiary">
        {{ $t(card.total.title) }}
      </p>
    </div>

    <p
      class="relative px-2 text-[20px] leading-6 font-semibold whitespace-nowrap text-fig-text-primary"
    >
      {{ format(card.total.count) }}
    </p>

    <!-- `mt-auto` — qo'shni karta balandroq bo'lsa ham panel pastda qoladi -->
    <div v-if="rows.length" class="mt-auto flex flex-col gap-1.5 rounded-xl bg-fig-bg-secondary px-3 py-1.5">
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
  </div>
</template>
