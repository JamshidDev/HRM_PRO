<script setup>
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import DocumentContent from '@/pages/app/documentSignature/ui/DocumentContent.vue'
  import SignMethods from '@/pages/app/documentSignature/ui/SignMethods.vue'
  import LinkExpired from '@/pages/app/documentSignature/ui/LinkExpired.vue'
  import { CheckmarkCircle24Filled, DismissCircle24Filled } from '@vicons/fluent'

  const store = usePdfViewerStore()

  // Qat'iy 5 daqiqa: muddat tugasa imzolash usullari yopiladi.
  const now = ref(Date.now())
  const timer = setInterval(() => (now.value = Date.now()), 1000)
  onBeforeUnmount(() => clearInterval(timer))
  const left = computed(() =>
    store.signDeadline ? Math.max(0, Math.ceil((store.signDeadline - now.value) / 1000)) : 0
  )
  const expired = computed(() => !store.isSigned && !store.rejectedNow && left.value === 0)
  watch(expired, (v) => (store.linkExpired = v), { immediate: true })
  // Qolgan vaqt sarlavhadagi chipda ko'rsatiladi (ToolBar.vue).
  watch(left, (v) => (store.linkLeft = v), { immediate: true })
</script>

<template>
  <div>
    <template v-if="store.pdfUrl && !store.checkLoading">
      <div v-if="store.signedNow" class="px-4 mt-4">
        <div
          class="max-w-[800px] mx-auto flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-success"
        >
          <n-icon size="22"><CheckmarkCircle24Filled /></n-icon>
          <span class="font-medium">{{ $t('signature.signedSuccess') }}</span>
        </div>
      </div>
      <div v-if="store.rejectedNow" class="px-4 mt-4">
        <div
          class="max-w-[800px] mx-auto flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-danger"
        >
          <n-icon size="22"><DismissCircle24Filled /></n-icon>
          <span class="font-medium">{{ $t('signature.rejectedSuccess') }}</span>
        </div>
      </div>
      <DocumentContent />
      <SignMethods v-if="!store.isSigned && !store.rejectedNow && !expired" />
      <!-- Sanoq sarlavhada; muddat tugasa imzolash bloki o'rnida nima qilish kerakligi yoziladi -->
      <LinkExpired v-else-if="expired" />
    </template>
  </div>
</template>
