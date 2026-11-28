<script setup>
  import i18n from '@/i18n/index.js'
  import { Checkmark16Filled } from '@vicons/fluent'
  import { useConfApplicationStore, useComponentStore } from '@/store/modules/index.js'

  // Ariza formasi qadamlari — modal sarlavhasida.
  const store = useConfApplicationStore()
  const componentStore = useComponentStore()

  const steps = computed(() => [
    i18n.global.t('applicationPage.step.stepOne'),
    i18n.global.t('applicationPage.step.stepTwo'),
    i18n.global.t('applicationPage.step.stepThree')
  ])

  const applicationName = computed(
    () => componentStore.workerApplicationTypes.find((v) => v.id === store.payload.type)?.name
  )
</script>

<template>
  <!-- Qadamlar: tugagan ✓, joriy ko'k, keyingisi kulrang; tanlangan tur 1-qadam tooltip'ida. -->
  <div class="app-steps">
    <template v-for="(step, i) in steps" :key="i">
      <div v-if="i" class="app-steps__line" :class="{ 'is-done': i < store.stepNumber }" />
      <div
        class="app-steps__item"
        :class="{
          'is-done': i + 1 < store.stepNumber,
          'is-active': i + 1 === store.stepNumber,
          'is-error': i + 1 === store.stepNumber && store.stepStatus === 'error'
        }"
      >
        <span class="app-steps__dot">
          <n-icon v-if="i + 1 < store.stepNumber" size="14"><Checkmark16Filled /></n-icon>
          <template v-else>{{ i + 1 }}</template>
        </span>
        <div class="min-w-0">
          <div
            class="app-steps__title"
            :title="i === 0 && store.stepNumber > 1 ? applicationName : undefined"
          >
            {{ step }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .app-steps {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding-right: 12px;
    font-weight: 400;
  }
  .app-steps__item {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    color: var(--textColor3);
  }
  .app-steps__dot {
    flex: 0 0 24px;
    height: 24px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    border: 1.5px solid var(--surface-line);
    background: var(--surface-section);
  }
  .app-steps__title {
    font-size: 13px;
    font-weight: 500;
    line-height: 24px;
    white-space: nowrap;
  }
  .app-steps__line {
    flex: 1 1 16px;
    min-width: 16px;
    height: 2px;
    border-radius: 2px;
    background: var(--surface-line);
  }
  .app-steps__line.is-done {
    background: var(--success-color);
  }
  .app-steps__item.is-active {
    color: var(--textColor1, inherit);
  }
  .app-steps__item.is-active .app-steps__dot {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: #fff;
  }
  .app-steps__item.is-done .app-steps__dot {
    border-color: var(--success-color);
    background: var(--success-color);
    color: #fff;
  }
  .app-steps__item.is-error .app-steps__dot {
    border-color: #e5484d;
    background: #e5484d;
  }
  /* Mobilda nomlar qisqaradi, faqat joriy qadam nomi to'liq. */
  @media (max-width: 640px) {
    .app-steps__item:not(.is-active) .app-steps__title {
      display: none;
    }
  }
</style>
