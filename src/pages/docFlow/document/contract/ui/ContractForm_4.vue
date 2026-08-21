<script setup>
  import { UIFigBlock } from '@/components/index.js'
  import icons from '@/assets/icons'
</script>

<template>
  <UIFigBlock :title="$t('contractPage.step.stepFour')" :icon="icons.figBadgeCheck">
    <div class="flex flex-col items-center gap-3 w-full py-6">
      <span class="succeed-icon">
        <n-icon :size="36">
          <component :is="icons.figBadgeCheck" />
        </n-icon>
      </span>
      <h3 class="text-base font-semibold text-fig-text-primary text-center">
        {{ $t('contractPage.succeedText') }}
      </h3>
    </div>
  </UIFigBlock>
</template>

<style lang="scss" scoped>
  .succeed-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 9999px;
    background: var(--fig-green-100);
    color: var(--fig-text-green);
  }
</style>
