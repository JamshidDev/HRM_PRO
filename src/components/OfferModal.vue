<script setup>
  import { ref, nextTick } from 'vue'
  import { useLoginNewStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { Document24Regular, ArrowDownload24Regular, CheckmarkCircle16Filled } from '@vicons/fluent'

  const store = useLoginNewStore()

  // 2 hujjat — Foydalanish shartlari (Terms) + Maxfiylik siyosati (Privacy), tilga moslab.
  const docs = [
    { key: 'terms', labelKey: 'offerModal.terms', prefix: 'Terms' },
    { key: 'privacy', labelKey: 'offerModal.privacy', prefix: 'Privacy' }
  ]
  const activeKey = ref('terms')

  const langSuffix = () => {
    const l = localStorage.getItem(useAppSetting.languageKey) || 'uz'
    return l === 'ru' ? 'RU' : l === 'en' ? 'EN' : 'UZ'
  }
  const fileBase = (key) => {
    const doc = docs.find((d) => d.key === key) ?? docs[0]
    return `/terms/HRM_PRO_${doc.prefix}_${langSuffix()}`
  }
  const pdfUrl = (key) => `${fileBase(key)}.pdf`

  // Hujjat matni (headings/clauses/bullets) — PDF'lardan oldindan chiqarilgan JSON,
  // shu bilan foydalanuvchi butun matnni modal ichida o'qiy oladi.
  const docCache = {}
  const docBlocks = ref([])
  const docLoading = ref(false)
  const docLoadError = ref(false)

  const loadDoc = async (key) => {
    const cacheKey = `${key}_${langSuffix()}`
    if (docCache[cacheKey]) {
      docBlocks.value = docCache[cacheKey]
      return
    }
    docLoading.value = true
    docLoadError.value = false
    try {
      const res = await fetch(`${fileBase(key)}.json`)
      if (!res.ok) throw new Error('not ok')
      const data = await res.json()
      docCache[cacheKey] = data.blocks
      docBlocks.value = data.blocks
    } catch {
      docLoadError.value = true
      docBlocks.value = []
    } finally {
      docLoading.value = false
    }
  }

  // Har bir hujjat oxirigacha scroll qilinganda `true` bo'ladi — ikkalasi ham
  // o'qilmaguncha "Roziman va davom etaman" tugmasi disabled turadi.
  const readState = ref({ terms: false, privacy: false })
  const canAccept = computed(() => docs.every((d) => readState.value[d.key]))

  const bodyRef = ref(null)
  let scrollElement = null
  const SCROLL_BOTTOM_THRESHOLD = 24

  const isScrolledToBottom = (el) =>
    !!el && el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_BOTTOM_THRESHOLD

  const onBodyScroll = (e) => {
    if (isScrolledToBottom(e.target)) {
      readState.value[activeKey.value] = true
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
      readState.value[activeKey.value] = true
    }
    scrollElement.addEventListener('scroll', onBodyScroll)
  }

  const loadActive = async () => {
    await loadDoc(activeKey.value)
    await attachScrollListener()
  }

  // Modal ochilganda birinchi hujjatni (Terms) yuklaymiz, o'qilganlik holatini tozalaymiz.
  watch(
    () => store.showOfferModal,
    async (v) => {
      if (!v) {
        detachScrollListener()
        return
      }
      activeKey.value = 'terms'
      readState.value = { terms: false, privacy: false }
      await nextTick()
      await loadActive()
    }
  )

  const selectDoc = async (key) => {
    if (key === activeKey.value) return
    activeKey.value = key
    await loadActive()
  }
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
      <!-- Header: ikonka + sarlavha + subtitle + hujjat tablari -->
      <div class="px-6 py-5 bg-surface-ground border-b border-surface-line">
        <div class="flex items-start gap-3.5">
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

        <div class="flex items-center gap-2 mt-4">
          <n-button
            v-for="d in docs"
            :key="d.key"
            size="small"
            :type="activeKey === d.key ? 'primary' : 'default'"
            @click="selectDoc(d.key)"
          >
            {{ $t(d.labelKey) }}
            <n-icon
              v-if="readState[d.key]"
              :size="14"
              :component="CheckmarkCircle16Filled"
              class="ml-1"
            />
          </n-button>
        </div>
      </div>

      <!-- Hujjat matni — scroll-gate shu konteynerda ishlaydi -->
      <div ref="bodyRef" class="offer-modal-body flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <div v-if="docLoadError" class="text-sm text-textColor3 text-center py-10">
          {{ $t('offerModal.loadError') }}
        </div>
        <template v-else>
          <template v-for="(block, idx) in docBlocks" :key="idx">
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

          <div v-if="docLoading" class="flex items-center justify-center py-10">
            <n-spin size="small" />
          </div>

          <a
            v-else
            :href="pdfUrl(activeKey)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-4"
          >
            <n-icon :size="18" :component="ArrowDownload24Regular" />
            {{ $t('offerModal.downloadLabel') }}
          </a>
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
          :disabled="!canAccept"
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
