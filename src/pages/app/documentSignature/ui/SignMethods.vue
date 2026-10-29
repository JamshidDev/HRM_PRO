<script setup>
  /**
   * Imzolash kartasi: sarlavha, kim uchun havola (izoh), usul tanlash kartochkalari,
   * tanlangan usul maydoni va pastki qator — chapda «Rad etish», o'ngda asosiy amal.
   * Asosiy amal usulga qarab: chizish — «Tasdiqlash», kompyuter — «E-IMZO bilan imzolash»,
   * telefon — «Boshlash» (QR/ilova ochilgandan keyin tugma kerak emas).
   */
  import { useRoute } from 'vue-router'
  import { usePdfViewerStore, useSignatureStore } from '@/store/modules/index.js'
  import SignatureBox from '@/pages/app/documentSignature/ui/SignatureBox.vue'
  import MobileEimzo from '@/pages/app/documentSignature/ui/MobileEimzo.vue'
  import LinkReject from '@/pages/app/documentSignature/ui/LinkReject.vue'
  import {
    Signature20Regular,
    Key20Regular,
    Key24Regular,
    Phone20Regular,
    Info16Regular,
    Checkmark20Filled,
    DismissCircle20Regular
  } from '@vicons/fluent'

  const store = usePdfViewerStore()
  const signStore = useSignatureStore()
  const route = useRoute()
  const isPhone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  // Telefonda odatda E-IMZO ilovasi, kompyuterda — chizish.
  const tab = ref(isPhone ? 'mobile' : 'draw')

  const boxRef = ref(null)
  const mobileRef = ref(null)
  const rejectRef = ref(null)

  const methods = [
    { key: 'draw', icon: Signature20Regular, label: 'signature.methodDraw', hint: 'signature.methodDrawHint' },
    { key: 'eimzo', icon: Key20Regular, label: 'signature.methodEimzo', hint: 'signature.methodEimzoHint' },
    { key: 'mobile', icon: Phone20Regular, label: 'signature.methodMobile', hint: 'signature.methodMobileHint' }
  ]

  const onEimzo = () => {
    signStore._signatureLink(route.query.token, () => store.markLinkSigned())
  }

  // Pastki qatordagi asosiy tugma — tanlangan usulga mos matn, holat va amal.
  const action = computed(() => {
    if (tab.value === 'draw') {
      return {
        label: 'content.confirm',
        loading: store.saveLoading,
        disabled: !boxRef.value?.hasDrawing,
        run: () => boxRef.value?.confirm()
      }
    }
    if (tab.value === 'eimzo') {
      return { label: 'signature.eimzoSign', loading: signStore.loading, run: onEimzo }
    }
    if (store.mobileSession) return null
    return {
      label: 'signature.mobileStart',
      loading: store.mobileLoading,
      run: () => mobileRef.value?.start()
    }
  })
</script>

<template>
  <div id="draw-signature" class="w-full max-w-[800px] mx-auto px-4 pt-10 mb-[160px]">
    <div class="rounded-xl border border-surface-line bg-surface-section p-4 sm:p-5">
      <h3 class="text-lg font-semibold text-textColor1">{{ $t('signature.signTitle') }}</h3>

      <!-- Havola kim uchun ekanligi -->
      <div
        class="mt-3 flex gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-textColor2"
      >
        <n-icon size="16" class="mt-0.5 shrink-0 text-primary"><Info16Regular /></n-icon>
        <span>{{ $t('signature.signatureWorker', { name: store.signatureWorker }) }}</span>
      </div>

      <!-- Usul tanlash -->
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup">
        <button
          v-for="m in methods"
          :key="m.key"
          type="button"
          role="radio"
          :aria-checked="tab === m.key"
          class="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors"
          :class="
            tab === m.key
              ? 'border-primary bg-primary/5'
              : 'border-surface-line hover:bg-surface-ground'
          "
          @click="tab = m.key"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full"
            :class="tab === m.key ? 'bg-primary text-white' : 'bg-surface-ground text-textColor2'"
          >
            <n-icon size="18"><component :is="m.icon" /></n-icon>
          </span>
          <span class="min-w-0">
            <span
              class="block text-sm font-medium"
              :class="tab === m.key ? 'text-primary' : 'text-textColor1'"
            >
              {{ $t(m.label) }}
            </span>
            <span class="block truncate text-xs text-textColor3">{{ $t(m.hint) }}</span>
          </span>
        </button>
      </div>

      <!-- Tanlangan usul maydoni -->
      <div class="mt-4">
        <SignatureBox v-if="tab === 'draw'" ref="boxRef" />
        <div
          v-else-if="tab === 'eimzo'"
          class="rounded-xl border border-dashed border-surface-line bg-surface-ground p-6 text-center"
        >
          <n-icon size="36" class="text-primary"><Key24Regular /></n-icon>
          <p class="text-sm text-textColor2 mt-2">{{ $t('signature.eimzoHint') }}</p>
        </div>
        <MobileEimzo v-else ref="mobileRef" :is-phone="isPhone" />
      </div>

      <!-- Qaror qatori: rad etish va imzolash -->
      <div
        class="mt-5 pt-4 border-t border-surface-line flex flex-wrap items-center justify-between gap-2"
      >
        <n-button secondary type="error" @click="rejectRef?.open()">
          <template #icon><DismissCircle20Regular /></template>
          {{ $t('documentPage.signature.rejectTitle') }}
        </n-button>
        <n-button
          v-if="action"
          type="primary"
          :loading="action.loading"
          :disabled="action.disabled"
          @click="action.run"
        >
          <template #icon><Checkmark20Filled /></template>
          {{ $t(action.label) }}
        </n-button>
      </div>
    </div>
    <LinkReject ref="rejectRef" />
  </div>
</template>
