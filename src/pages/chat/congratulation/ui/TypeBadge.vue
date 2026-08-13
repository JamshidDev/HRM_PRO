<script setup>
  import { cn } from '@utils'

  defineProps({
    // { id, name } — tur id'si maketdagi rangni tanlaydi, nomi API'dan keladi.
    type: {
      type: Object,
      default: null
    }
  })

  // 1 Tug'ilgan kun · 2 Ta'til · 3 Tibbiy ko'rik · 4 Pasport · 5 Mobil ilova · 6 Turniket
  const tints = {
    1: 'bg-fig-chip-brand text-fig-chip-brand-text',
    2: 'bg-fig-chip-amber text-fig-chip-amber-text',
    3: 'bg-fig-chip-green text-fig-chip-green-text',
    4: 'bg-fig-chip-indigo text-fig-chip-indigo-text',
    5: 'bg-fig-chip-pink text-fig-chip-pink-text',
    6: 'bg-fig-chip-lime text-fig-chip-lime-text'
  }
</script>

<template>
  <span
    v-if="type?.name"
    :class="
      cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[12px] leading-[16px] font-semibold whitespace-nowrap',
        tints[type?.id] || 'bg-fig-chip-brand text-fig-chip-brand-text'
      )
    "
  >
    {{ type.name }}
  </span>
</template>
