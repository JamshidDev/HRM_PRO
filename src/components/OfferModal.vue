<script setup>
  import { ref, nextTick } from 'vue'
  import { useLoginNewStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { Document24Regular, ArrowDownload24Regular } from '@vicons/fluent'

  const store = useLoginNewStore()

  // 2 hujjat — Foydalanish shartlari (Terms) + Maxfiylik siyosati (Privacy), bitta
  // scroll qilinadigan ro'yxatda ketma-ket ko'rsatiladi (alohida tab emas).
  const docs = [
    { key: 'terms', labelKey: 'offerModal.terms', prefix: 'Terms' },
    { key: 'privacy', labelKey: 'offerModal.privacy', prefix: 'Privacy' }
  ]

  const langSuffix = () => {
    const l = localStorage.getItem(useAppSetting.languageKey) || 'uz'
    return l === 'ru' ? 'RU' : l === 'en' ? 'EN' : 'UZ'
  }
  const fileBase = (key) => {
    const doc = docs.find((d) => d.key === key) ?? docs[0]
    return `/terms/HRM_PRO_${doc.prefix}_${langSuffix()}`
  }
  const pdfUrl = (key) => `${fileBase(key)}.pdf`

  // Har ikkala hujjat matni (headings/clauses/bullets) — PDF'lardan oldindan
  // chiqarilgan JSON, shu bilan foydalanuvchi butun matnni modal ichida o'qiy oladi.
  const docCache = {}
  const termsBlocks = ref([])
  const privacyBlocks = ref([])
  const docLoading = ref(false)
  const docLoadError = ref(false)

  const fetchBlocks = async (key) => {
    const cacheKey = `${key}_${langSuffix()}`
    if (docCache[cacheKey]) return docCache[cacheKey]
    const res = await fetch(`${fileBase(key)}.json`)
    if (!res.ok) throw new Error('not ok')
    const data = await res.json()
    docCache[cacheKey] = data.blocks
    return data.blocks
  }

  const loadDocs = async () => {
    docLoading.value = true
    docLoadError.value = false
    try {
      const [terms, privacy] = await Promise.all([fetchBlocks('terms'), fetchBlocks('privacy')])
      termsBlocks.value = terms
      privacyBlocks.value = privacy
    } catch {
      docLoadError.value = true
      termsBlocks.value = []
      privacyBlocks.value = []
    } finally {
      docLoading.value = false
    }
  }

  // Ikkala hujjat matni joylashgan konteyner oxirigacha scroll qilinmaguncha
  // "Roziman va davom etaman" tugmasi disabled turadi.
  const hasReadToEnd = ref(false)
  const bodyRef = ref(null)
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

  // Modal ochilganda ikkala hujjatni yuklaymiz, o'qilganlik holatini tozalaymiz.
  watch(
    () => store.showOfferModal,
    async (v) => {
      if (!v) {
        detachScrollListener()
        return
      }
      hasReadToEnd.value = false
      await loadDocs()
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

      <!-- Hujjatlar matni — scroll-gate shu konteynerda ishlaydi -->
      <div ref="bodyRef" class="offer-modal-body flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <div v-if="docLoadError" class="text-sm text-textColor3 text-center py-10">
          {{ $t('offerModal.loadError') }}
        </div>
        <div v-else-if="docLoading" class="flex items-center justify-center py-10">
          <n-spin size="small" />
        </div>
        <template v-else>
          <!-- Foydalanish shartlari -->
          <section>
            <h2 class="text-base font-bold text-textColor0 mb-3">
              {{ $t('offerModal.terms') }}
            </h2>
            <template v-for="(block, idx) in termsBlocks" :key="`terms-${idx}`">
              <h3
                v-if="block.type === 'heading'"
                class="text-sm font-semibold text-textColor0 mt-5 first:mt-0 mb-2"
              >
                {{ block.text }}
              </h3>
              <div v-else-if="block.type === 'bullet'" class="flex gap-2 mb-1.5">
                <span class="text-sm text-textColor3 shrink-0">–</span>
                <p class="text-sm text-textColor3 leading-6">{{ block.text }}</p>
              </div>
              <p v-else class="text-sm text-textColor3 leading-6 mb-2">
                {{ block.text }}
              </p>
            </template>
            <a
              :href="pdfUrl('terms')"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-4"
            >
              <n-icon :size="18" :component="ArrowDownload24Regular" />
              {{ $t('offerModal.downloadLabel') }}
            </a>
          </section>

          <!-- Maxfiylik siyosati -->
          <section class="mt-8 pt-6 border-t border-surface-line">
            <h2 class="text-base font-bold text-textColor0 mb-3">
              {{ $t('offerModal.privacy') }}
            </h2>
            <template v-for="(block, idx) in privacyBlocks" :key="`privacy-${idx}`">
              <h3
                v-if="block.type === 'heading'"
                class="text-sm font-semibold text-textColor0 mt-5 first:mt-0 mb-2"
              >
                {{ block.text }}
              </h3>
              <div v-else-if="block.type === 'bullet'" class="flex gap-2 mb-1.5">
                <span class="text-sm text-textColor3 shrink-0">–</span>
                <p class="text-sm text-textColor3 leading-6">{{ block.text }}</p>
              </div>
              <p v-else class="text-sm text-textColor3 leading-6 mb-2">
                {{ block.text }}
              </p>
            </template>
            <a
              :href="pdfUrl('privacy')"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-4"
            >
              <n-icon :size="18" :component="ArrowDownload24Regular" />
              {{ $t('offerModal.downloadLabel') }}
            </a>
          </section>
        </template>
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
    max-width: 560px;
    height: 88vh;
    max-height: 88vh;
  }

  .offer-modal-decline {
    color: var(--error-color, #d03050) !important;
    border-color: var(--error-color, #d03050) !important;
  }
</style>
