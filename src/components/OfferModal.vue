<script setup>
  import { ref, nextTick } from 'vue'
  import { useLoginNewStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { Document24Regular, ArrowDownload24Regular } from '@vicons/fluent'

  const store = useLoginNewStore()

  const items = [1, 2, 3].map((n) => ({
    titleKey: `offerModal.item${n}Title`,
    textKey: `offerModal.item${n}Text`
  }))

  const langSuffix = () => {
    const l = localStorage.getItem(useAppSetting.languageKey) || 'uz'
    return l === 'ru' ? 'RU' : l === 'en' ? 'EN' : 'UZ'
  }
  const termsUrl = () => `/terms/HRM_PRO_Terms_${langSuffix()}.pdf`

  // Band matnlari joylashgan konteyner oxirigacha scroll qilinmaguncha
  // "Roziman va davom etaman" tugmasi disabled turadi.
  const bodyRef = ref(null)
  const hasReadToEnd = ref(false)
  let scrollElement = null
  const SCROLL_BOTTOM_THRESHOLD = 24

  const isScrolledToBottom = (el) =>
    !!el && el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_BOTTOM_THRESHOLD

  const onBodyScroll = (e) => {
    if (isScrolledToBottom(e.target)) {
      hasReadToEnd.value = true
    }
  }

  const detachScrollListener = () => {
    scrollElement?.removeEventListener('scroll', onBodyScroll)
    scrollElement = null
  }

  const attachScrollListener = async () => {
    detachScrollListener()
    await nextTick()
    const el = bodyRef.value
    if (!el) return
    scrollElement = el
    // Matn scroll qilmasdanoq to'liq ko'rinsa — o'qilgan deb hisoblaymiz.
    if (isScrolledToBottom(el)) {
      hasReadToEnd.value = true
    }
    scrollElement.addEventListener('scroll', onBodyScroll)
  }

  // Modal ochilganda o'qilganlik holatini tozalab, scroll holatini qayta tekshiramiz.
  watch(
    () => store.showOfferModal,
    async (v) => {
      if (!v) {
        detachScrollListener()
        return
      }
      hasReadToEnd.value = false
      await attachScrollListener()
    }
  )
</script>

<template>
  <n-modal
    :show="store.showOfferModal"
    :mask-closable="false"
    :close-on-esc="false"
    :auto-focus="false"
    :trap-focus="false"
  >
    <div class="offer-modal-card bg-surface-section rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header: ikonka + sarlavha + subtitle -->
      <div class="px-6 py-5 bg-surface-ground flex items-start gap-3.5 border-b border-surface-line">
        <div class="offer-modal-icon shrink-0 w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <n-icon :size="22" :component="Document24Regular" class="text-primary" />
        </div>
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-textColor0">
            {{ $t('offerModal.title') }}
          </h2>
          <p class="text-sm text-textColor3 mt-0.5">
            {{ $t('offerModal.desc') }}
          </p>
        </div>
      </div>

      <!-- Band matnlari — scroll-gate shu konteynerda ishlaydi -->
      <div ref="bodyRef" class="offer-modal-body flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <div v-for="item in items" :key="item.titleKey" class="mb-5 last:mb-0">
          <h3 class="text-sm font-semibold text-textColor0 mb-1">
            {{ $t(item.titleKey) }}
          </h3>
          <p class="text-sm text-textColor3 leading-6">
            {{ $t(item.textKey) }}
          </p>
        </div>

        <a
          :href="termsUrl()"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <n-icon :size="18" :component="ArrowDownload24Regular" />
          {{ $t('offerModal.downloadLabel') }}
        </a>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-surface-line flex items-center gap-3">
        <n-button class="offer-modal-decline flex-1" round @click="store._declineOffer()">
          {{ $t('offerModal.decline') }}
        </n-button>
        <n-button
          type="primary"
          round
          class="flex-1"
          :disabled="!hasReadToEnd"
          :loading="store.offerLoading"
          @click="store._acceptOfferAndContinue()"
        >
          {{ $t('offerModal.accept') }}
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
  .offer-modal-card {
    width: 94vw;
    max-width: 460px;
    max-height: 90vh;
  }

  .offer-modal-body {
    max-height: 42vh;
  }

  .offer-modal-decline {
    color: var(--error-color, #d03050) !important;
    border-color: var(--error-color, #d03050) !important;
  }
</style>
