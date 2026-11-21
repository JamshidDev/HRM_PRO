<script setup>
  import { useRoute } from 'vue-router'
  import { DesktopArrowRight24Regular, Warning24Regular } from '@vicons/fluent'
  import { useSocketStore } from '@/store/modules/app/socketStore.js'
  import { useExamProctorStore } from '@/store/modules/attestation/examProctorStore.js'
  import { useExamAttemptStore } from '@/store/modules/attestation/examAttemptStore.js'

  // Global agent: yechish sahifasida ekran ulashish talabi va kuzatuvchiga oqim uzatish.
  const route = useRoute()
  const socketStore = useSocketStore()
  const store = useExamProctorStore()

  watch(
    () => socketStore.socket,
    (s) => store.bindSocket(s),
    { immediate: true }
  )

  watch(
    () => (route.name === 'solve_exam' ? Number(route.params.exam_id) : null),
    (id) => (id ? store.loadAttempt(id) : store.leaveAttempt()),
    { immediate: true }
  )

  const blocked = computed(() => route.name === 'solve_exam' && store.needScreen)

  // Imtihon davomida sahifani yangilash/yopishdan oldin brauzer tasdig'i.
  const attemptStore = useExamAttemptStore()
  const onBeforeUnload = (e) => {
    if (route.name !== 'solve_exam' || attemptStore.result) return
    e.preventDefault()
    e.returnValue = ''
  }
  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>

<template>
  <!-- Kuzatuvchi ogohlantirishi: nomzod tasdiqlamaguncha oyna yopilmaydi. -->
  <div
    v-if="store.alerts.length"
    class="fixed inset-0 z-[3100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div
      class="bg-surface-section rounded-2xl shadow-card max-w-[440px] w-full p-6 flex flex-col items-center gap-3 text-center"
    >
      <span
        class="w-14 h-14 rounded-2xl bg-fig-chip-amber text-fig-chip-amber-text flex items-center justify-center"
      >
        <n-icon size="30"><Warning24Regular /></n-icon>
      </span>
      <p class="text-base font-semibold text-fig-text-primary">
        {{ $t('examMonitoringPage.alertTitle') }}
      </p>
      <p class="text-sm text-fig-text-secondary whitespace-pre-line">{{ store.alerts[0].text }}</p>
      <n-button type="primary" block @click="store.dismissAlert()">
        {{ $t('examMonitoringPage.alertOk') }}
      </n-button>
    </div>
  </div>

  <!-- Ekran kuzatuvi majburiy: butun ekran ulashilmaguncha imtihon oynasi yopiq turadi. -->
  <div
    v-if="blocked"
    class="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div
      class="bg-surface-section rounded-2xl shadow-card max-w-[440px] w-full p-6 flex flex-col items-center gap-3 text-center"
    >
      <span
        class="w-14 h-14 rounded-2xl bg-fig-chip-brand text-fig-chip-brand-text flex items-center justify-center"
      >
        <n-icon size="30"><DesktopArrowRight24Regular /></n-icon>
      </span>
      <p class="text-[16px] font-semibold text-fig-text-primary">
        {{ $t('examMonitoringPage.screenRequiredTitle') }}
      </p>
      <p class="text-[13px] text-fig-text-secondary">
        {{ $t('examMonitoringPage.screenRequiredText') }}
      </p>
      <p v-if="store.screenError" class="text-[12px] text-fig-text-red">
        {{ $t(`examMonitoringPage.screenError.${store.screenError}`) }}
      </p>
      <n-button type="primary" block @click="store.shareScreen()">
        {{ $t('examMonitoringPage.shareScreen') }}
      </n-button>
    </div>
  </div>
</template>
