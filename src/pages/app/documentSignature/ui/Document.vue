<script setup>
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import DocumentContent from '@/pages/app/documentSignature/ui/DocumentContent.vue'
  import SignMethods from '@/pages/app/documentSignature/ui/SignMethods.vue'
  import LinkExpired from '@/pages/app/documentSignature/ui/LinkExpired.vue'
  import {
    CheckmarkCircle24Filled,
    DismissCircle24Filled,
    LockClosed16Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = usePdfViewerStore()

  // Qat'iy 5 daqiqa: muddat tugasa imzolash usullari yopiladi.
  const now = ref(Date.now())
  const timer = setInterval(() => (now.value = Date.now()), 1000)
  onBeforeUnmount(() => clearInterval(timer))
  const left = computed(() =>
    store.signDeadline ? Math.max(0, Math.ceil((store.signDeadline - now.value) / 1000)) : 0
  )
  const expired = computed(
    () => !store.isSigned && !store.rejectedNow && !store.errorMessage && left.value === 0
  )
  watch(expired, (v) => (store.linkExpired = v), { immediate: true })
  // Qolgan vaqt sarlavhadagi chipda ko'rsatiladi (ToolBar.vue).
  watch(left, (v) => (store.linkLeft = v), { immediate: true })

  // Yakuniy natija: imzolandi (hozir yoki avval), rad etildi yoki ochilgandan keyingi xato.
  const result = computed(() => {
    if (store.rejectedNow)
      return { ok: false, title: t('signature.rejectedTitle'), hint: t('signature.rejectedHint') }
    if (store.errorMessage) return { ok: false, title: store.errorMessage, hint: '' }
    if (store.signedNow)
      return { ok: true, title: t('signature.signedSuccess'), hint: t('signature.doneHint') }
    if (store.isSigned)
      return { ok: true, title: t('signature.alreadySigned'), hint: t('signature.doneHint') }
    return null
  })
</script>

<template>
  <div
    v-if="store.pdfUrl && !store.checkLoading"
    class="sign-page mx-auto w-full max-w-[1680px] px-3 pb-10 pt-5 sm:px-6 sm:pt-6 lg:pb-4"
  >
    <!-- Kompyuterda: chapda hujjat, o'ngda doim ko'rinib turadigan imzolash paneli (sticky).
         Telefonda (< lg): hujjat, uning ostida panel; yakuniy natija esa hujjatdan tepada. -->
    <div class="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_500px] lg:items-start lg:gap-6">
      <div class="min-w-0">
        <DocumentContent />
      </div>

      <aside
        class="mt-6 flex flex-col gap-3 lg:sticky lg:top-[80px] lg:order-none lg:mt-0 lg:h-[calc(100vh-96px)]"
        :class="{ 'order-first !mt-0 mb-4': result || expired }"
      >
        <!-- Panel ichidagi almashinuv (imzolash → natija / muddat tugadi) silliq: eskisi so'nib, yangisi ko'tarilib
             chiqadi. Natija kartalari ham panel balandligini to'liq egallaydi — panel «kichrayib» qolmaydi. -->
        <Transition name="panel-swap" mode="out-in">
          <!-- Yakuniy holat — panel o'rnida bitta aniq karta: nima bo'ldi va endi nima qilish kerak -->
          <div
            v-if="result"
            :key="`result-${result.ok}`"
            class="sign-card flex flex-col items-center justify-center px-6 py-10 text-center lg:flex-1"
          >
            <span class="sign-result__icon" :class="result.ok ? 'is-ok' : 'is-bad'">
              <n-icon size="40">
                <CheckmarkCircle24Filled v-if="result.ok" />
                <DismissCircle24Filled v-else />
              </n-icon>
            </span>
            <h3 class="mt-4 text-xl font-semibold text-textColor0">{{ result.title }}</h3>
            <p v-if="result.hint" class="mt-1.5 max-w-[300px] text-sm text-textColor2">
              {{ result.hint }}
            </p>
          </div>
          <SignMethods
            v-else-if="!store.isSigned && !store.rejectedNow && !store.errorMessage && !expired"
            key="sign"
            class="lg:flex-1"
          />
          <!-- Sanoq sarlavhada; muddat tugasa imzolash bloki o'rnida nima qilish kerakligi yoziladi -->
          <LinkExpired v-else-if="expired" key="expired" class="lg:flex-1 lg:justify-center" />
        </Transition>

        <p class="flex items-start justify-center gap-1.5 px-2 text-center text-xs text-textColor3">
          <n-icon size="14" class="mt-px shrink-0"><LockClosed16Regular /></n-icon>
          {{ $t('signature.secureFooter') }}
        </p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
  /* Panel va natija kartasi — bitta «ko'tarilgan» karta uslubi */
  .sign-card,
  :deep(.sign-card) {
    border: 1px solid var(--color-surface-line);
    border-radius: 20px;
    background: var(--color-surface-section);
    box-shadow:
      0 1px 2px rgb(16 24 40 / 4%),
      0 12px 32px -12px rgb(16 24 40 / 18%);
  }
  .sign-result__icon {
    display: flex;
    width: 76px;
    height: 76px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    animation: sign-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .sign-result__icon.is-ok {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 12%, transparent);
    box-shadow: 0 0 0 10px color-mix(in srgb, var(--color-success) 6%, transparent);
  }
  .sign-result__icon.is-bad {
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger) 12%, transparent);
    box-shadow: 0 0 0 10px color-mix(in srgb, var(--color-danger) 6%, transparent);
  }
  @keyframes sign-pop {
    from {
      transform: scale(0.4);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  /* Panel almashinuvi: eskisi biroz kichrayib so'nadi, yangisi pastdan ko'tarilib chiqadi */
  .panel-swap-enter-active,
  .panel-swap-leave-active {
    transition:
      opacity 0.35s ease,
      transform 0.35s ease;
  }
  .panel-swap-enter-from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  .panel-swap-leave-to {
    opacity: 0;
    transform: scale(0.97);
  }
  @media (prefers-reduced-motion: reduce) {
    .sign-result__icon {
      animation: none;
    }
    .panel-swap-enter-active,
    .panel-swap-leave-active {
      transition: none;
    }
  }
</style>
