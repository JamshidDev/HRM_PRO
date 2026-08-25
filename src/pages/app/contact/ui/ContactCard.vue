<script setup>
  /**
   * Figma "Container" (node 2042:174473 / 174747 / 174763) — "Bog'lanish"
   * sahifasidagi bir xil qolipdagi uchta karta: yumaloq ikonka + sarlavha
   * (+ ixtiyoriy belgi), ajratuvchi chiziq, so'ng kontent.
   */
  import ornamentUrl from '@/assets/icons/home/ornament.svg?url'
  import SoonBadge from './SoonBadge.vue'

  defineProps({
    icon: {
      type: [Object, Function],
      default: null
    },
    title: String,
    // "Tez kunda" kabi holat belgisi — berilmasa chizilmaydi
    badge: {
      type: String,
      default: null
    }
  })
</script>

<template>
  <div
    class="relative flex flex-col justify-center gap-3 overflow-hidden rounded-2xl bg-fig-block p-4"
  >
    <!-- Maketdagi bezak (node 2087:61115): kartaning yuqori markazida,
         90° burilgan; shaffoflik (4%) SVG ning o'zida. -->
    <img :src="ornamentUrl" alt="" aria-hidden="true" class="contact-card__ornament" />

    <div class="relative flex w-full items-center gap-3">
      <span v-if="icon" class="flex shrink-0 items-center rounded-full bg-fig-bg-tertiary p-1.5">
        <span class="flex h-4 w-4 items-center justify-center">
          <component :is="icon" />
        </span>
      </span>

      <p
        class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-semibold text-fig-text-primary"
      >
        {{ title }}
      </p>

      <SoonBadge v-if="badge" :text="badge" />
    </div>

    <div class="relative h-px w-full shrink-0 rounded-full bg-fig-bg-tertiary"></div>

    <div class="relative flex flex-col gap-3">
      <slot />
    </div>
  </div>
</template>

<style scoped>
  /* Maket: 307x161 quti kartaning tepasidan -32px da, ichidagi rasm 90° burilgan */
  .contact-card__ornament {
    position: absolute;
    top: -32px;
    left: 50%;
    width: 161px;
    height: 307px;
    max-width: none;
    transform: translate(-50%, -73px) rotate(90deg);
    pointer-events: none;
  }
</style>
