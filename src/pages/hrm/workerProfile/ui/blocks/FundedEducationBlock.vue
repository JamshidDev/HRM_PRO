<script setup>
  import { useWorkerProfileStore } from '@/store/modules/index.js'
  import { UIFigBlock } from '@/components/index.js'
  import icons from '@/assets/icons'

  // «Oliy ta'lim Jamiyat hisobidan moliyalashtirilgan» belgisi — bosilishi bilan saqlanadi.
  const store = useWorkerProfileStore()

  const checked = computed(() => Boolean(store.payload.company_funded_education))
  const disabled = computed(() => !store.workerId || store.loading)

  const toggle = () => {
    if (disabled.value) return
    store.payload.company_funded_education = !checked.value
    store.savePersonalInfo()
  }
</script>

<template>
  <UIFigBlock :title="$t('workerProfile.fundedEducation.title')" :icon="icons.figGraduationHat">
    <template #trailing>
      <span v-if="checked" class="funded-badge">
        <n-icon :size="16"><component :is="icons.figBadgeCheck" /></n-icon>
        {{ $t('workerProfile.fundedEducation.marked') }}
      </span>
    </template>

    <button
      type="button"
      class="funded-option"
      :class="{ 'is-checked': checked, 'is-disabled': disabled }"
      :disabled="disabled"
      role="checkbox"
      :aria-checked="checked"
      @click="toggle"
    >
      <n-checkbox :checked="checked" :disabled="disabled" class="pointer-events-none" />
      <span class="flex flex-col gap-1 min-w-0 text-left">
        <span class="text-sm font-semibold text-fig-text-primary">
          {{ $t('workerProfile.fundedEducation.label') }}
        </span>
        <span class="text-xs leading-4 funded-hint">
          {{ $t('workerProfile.fundedEducation.hint') }}
        </span>
      </span>
    </button>
  </UIFigBlock>
</template>

<style lang="scss" scoped>
  .funded-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    border: 1px solid var(--fig-br-disable);
    border-radius: 16px;
    background: var(--fig-bg-secondary);
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease;

    &:hover:not(.is-disabled) {
      border-color: var(--fig-text-brand);
    }

    &.is-checked {
      border-color: var(--fig-text-brand);
      background: var(--fig-bg-brand-surface);
    }

    &.is-disabled {
      cursor: progress;
      opacity: 0.7;
    }
  }

  .funded-hint {
    color: var(--fig-text-secondary);
  }

  .funded-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    color: var(--fig-text-green);
    background: var(--fig-bg-secondary);
  }
</style>
