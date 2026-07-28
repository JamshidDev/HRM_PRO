<script setup>
  import { computed } from 'vue'
  import { useLoginNewStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { Dismiss24Regular } from '@vicons/fluent'

  const store = useLoginNewStore()

  // Offerta hujjati (til bo'yicha) — login sahifasidagi termsFiles bilan bir xil.
  const offerFiles = {
    uz: '/terms/HRM_PRO_Legal_Document_UZ.pdf',
    ru: '/terms/HRM_PRO_Legal_Document_RU.pdf',
    en: '/terms/HRM_PRO_Legal_Document_EN.pdf'
  }
  const offerUrl = computed(() => {
    const lang = localStorage.getItem(useAppSetting.languageKey) || 'uz'
    return offerFiles[lang] ?? offerFiles.uz
  })
</script>

<template>
  <n-modal
    :show="store.showOfferModal"
    :mask-closable="false"
    :close-on-esc="false"
    :auto-focus="false"
    :trap-focus="false"
  >
    <div
      class="w-full max-w-[760px] mx-4 bg-surface-section rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style="max-height: 90vh"
    >
      <!-- Header -->
      <div class="px-6 pt-5 pb-4 border-b border-surface-line flex items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold text-textColor0">
            {{ $t('offerModal.title') }}
          </h2>
          <p class="text-xs text-textColor3 mt-0.5">
            {{ $t('offerModal.desc') }}
          </p>
        </div>
        <n-button quaternary circle size="small" @click="store._declineOffer()">
          <template #icon>
            <n-icon :size="18" :component="Dismiss24Regular" />
          </template>
        </n-button>
      </div>

      <!-- Offerta hujjati (PDF) -->
      <div class="flex-1 min-h-0 px-6 py-4">
        <iframe
          :src="offerUrl"
          class="w-full rounded-xl border border-surface-line"
          style="height: 55vh"
          :title="$t('offerModal.title')"
        ></iframe>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-surface-line flex justify-end gap-3">
        <n-button @click="store._declineOffer()">
          {{ $t('offerModal.decline') }}
        </n-button>
        <n-button
          type="primary"
          :loading="store.offerLoading"
          @click="store._acceptOfferAndContinue()"
        >
          {{ $t('offerModal.accept') }}
        </n-button>
      </div>
    </div>
  </n-modal>
</template>
