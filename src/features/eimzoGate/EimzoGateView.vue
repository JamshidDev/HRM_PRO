<script setup>
  // Iqtisod bo'limi route'lari o'rami: tasdiqlanmaguncha sahifa umuman yuklanmaydi
  // (API so'rovlari ketmaydi), o'rniga E-IMZO tasdiqlash kartasi chiqadi.
  import { ShieldKeyhole24Filled } from '@vicons/fluent'
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
  <div v-else class="flex flex-1 items-center justify-center p-4 py-16">
    <n-card
      :bordered="false"
      size="huge"
      role="dialog"
      class="rounded-3xl shadow-xl"
      :style="{ width: 'min(440px, 100%)' }"
      content-style="padding:0;"
    >
      <div class="px-8 pb-8 pt-9 flex flex-col items-center text-center">
        <div class="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <div
            class="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary"
          >
            <n-icon size="26"><ShieldKeyhole24Filled /></n-icon>
          </div>
        </div>

        <h3 class="text-xl font-semibold tracking-tight text-textColor0">
          {{ t('eimzoGate.title') }}
        </h3>

        <p class="mt-3 mb-5 max-w-[330px] text-sm leading-6 text-textColor2">
          {{ t('eimzoGate.description') }}
        </p>

        <n-button
          class="w-full !rounded-xl !font-semibold"
          type="primary"
          size="medium"
          block
          :loading="store.confirmLoading"
          @click="store._confirm()"
        >
          {{ t('eimzoGate.confirmBtn') }}
        </n-button>
      </div>
    </n-card>
  </div>
</template>
