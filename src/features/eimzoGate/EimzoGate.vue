<script setup>
  // Iqtisod bo'limi sahifalarida sessiya E-IMZO bilan tasdiqlanmaguncha
  // sahifani xiralashtirib, ustida tasdiqlash oynasini ko'rsatadi.
  import { ShieldKeyhole24Filled } from '@vicons/fluent'
  import { useRoute } from 'vue-router'
  import i18n from '@/i18n/index.js'
  import { useEimzoGateStore } from './eimzoGateStore.js'
  import { isGatedPath } from './config.js'

  const { t } = i18n.global
  const route = useRoute()
  const store = useEimzoGateStore()

  const gated = computed(() => isGatedPath(route.path))
  const visible = computed(() => gated.value && store.verified === false)

  // Iqtisod sahifasiga kirilganda holat bir marta so'raladi.
  watch(
    gated,
    (isGated) => {
      if (isGated && store.verified === null) store._status()
    },
    { immediate: true }
  )
</script>

<template>
  <!-- Faqat sahifa kontenti ustida — sidebar va header ochiq qoladi. -->
  <div
    v-if="visible"
    class="absolute inset-0 z-[60] flex items-center justify-center p-4"
    style="background: rgba(15, 23, 42, 0.28); backdrop-filter: blur(8px)"
  >
    <n-card
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="rounded-3xl shadow-2xl"
      :style="{ width: 'min(440px, 100%)' }"
      content-style="padding:0;"
    >
      <div class="px-8 pb-8 pt-9 flex flex-col items-center text-center">
        <!-- Ikonka: ikki qavatli halqa — diqqatni tortadi, lekin ogohlantirish emas -->
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

