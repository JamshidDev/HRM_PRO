<script setup>
  // Iqtisod bo'limi route'lari o'rami: tasdiqlanmaguncha sahifa umuman yuklanmaydi
  // (API so'rovlari ketmaydi), o'rniga E-IMZO tasdiqlash kartasi chiqadi.
  import { Key24Filled, ShieldKeyhole24Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { useEimzoGateStore } from './eimzoGateStore.js'

  const { t } = i18n.global
  const store = useEimzoGateStore()

  onMounted(() => {
    if (!store.known) store._status()
  })
</script>

<template>
  <RouterView v-if="store.known && !store.locked" />
  <div v-else-if="!store.known" class="flex flex-1 items-center justify-center py-24">
    <n-spin size="medium" />
  </div>
  <div v-else class="relative flex flex-1 overflow-hidden rounded-2xl">
    <!-- Orqa fon: sahifa yuklanmaydi, shuning uchun uning o'rnida xiralashtirilgan
         skelet ko'rsatiladi — "ma'lumot yopiq" degan taassurot beradi. -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 select-none p-6">
      <div class="flex flex-col gap-4 blur-[14px] opacity-60">
        <div class="flex items-center gap-3">
          <div class="h-9 w-56 rounded-xl bg-surface-line" />
          <div class="h-9 w-32 rounded-xl bg-surface-line" />
          <div class="h-9 w-32 rounded-xl bg-surface-line" />
          <div class="ml-auto h-9 w-28 rounded-xl bg-primary/30" />
        </div>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="h-24 rounded-2xl bg-surface-section shadow-sm" />
        </div>
        <div class="rounded-2xl bg-surface-section p-4 shadow-sm">
          <div class="mb-3 h-8 rounded-lg bg-primary/15" />
          <div
            v-for="i in 9"
            :key="i"
            class="flex gap-4 border-b border-surface-line py-3 last:border-0"
          >
            <div class="h-4 w-8 rounded bg-surface-line" />
            <div class="h-4 flex-1 rounded bg-surface-line" />
            <div class="h-4 w-24 rounded bg-surface-line" />
            <div class="h-4 w-24 rounded bg-surface-line" />
            <div class="h-4 w-20 rounded bg-surface-line" />
          </div>
        </div>
      </div>
      <div class="absolute -left-20 top-10 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div class="absolute -right-16 bottom-0 size-80 rounded-full bg-success/15 blur-3xl" />
    </div>

    <div class="absolute inset-0 bg-surface-ground/60 backdrop-blur-2xl" />

    <div class="relative z-10 flex flex-1 items-center justify-center p-4 py-16">
      <div
        role="dialog"
        class="w-[min(440px,100%)] rounded-3xl border border-white/40 bg-surface-section/85 px-8 pb-8 pt-9 text-center shadow-2xl backdrop-blur-xl"
      >
        <div class="relative mx-auto mb-6 flex size-20 items-center justify-center">
          <span
            class="absolute inset-0 animate-ping rounded-full bg-primary/10 [animation-duration:2.4s]"
          />
          <span class="absolute inset-0 rounded-full bg-primary/10" />
          <div
            class="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/30"
          >
            <n-icon size="28"><ShieldKeyhole24Filled /></n-icon>
          </div>
        </div>

        <h3 class="text-xl font-semibold tracking-tight text-textColor0">
          {{ t('eimzoGate.title') }}
        </h3>

        <p class="mx-auto mt-2.5 mb-6 max-w-[340px] text-sm leading-6 text-textColor2">
          {{ t('eimzoGate.description') }}
        </p>

        <n-button
          class="w-full !h-11 !rounded-xl !font-semibold"
          type="primary"
          block
          :loading="store.confirmLoading"
          @click="store._confirm()"
        >
          <template #icon>
            <n-icon><Key24Filled /></n-icon>
          </template>
          {{ t('eimzoGate.confirmBtn') }}
        </n-button>
      </div>
    </div>
  </div>
</template>
