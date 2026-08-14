<script setup>
  import watermarkUrl from '@/assets/icons/figBlockWatermark.svg?url'

  /**
   * Figma "Block" (node 2609:73390) — xodim profilidagi barcha kartalar shu qolipda.
   *
   * Maketdagi o'lchamlar: tashqi radius 32 / ichki padding 4, sarlavha paneli
   * px16 py8 va yuqori radiusi 28, tana p16 hamda ustunlar orasi 20.
   */
  defineProps({
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: Object,
      default: null
    },
    // Maketda kartaning o'ng pastki burchagidagi xira naqsh
    watermark: {
      type: Boolean,
      default: true
    }
  })
</script>

<template>
  <div class="profile-block">
    <div v-if="watermark" class="profile-block__watermark" aria-hidden="true">
      <img :src="watermarkUrl" alt="" />
    </div>

    <div class="profile-block__header">
      <div class="flex flex-1 min-w-0 items-center gap-2">
        <n-icon v-if="icon" :size="20" class="text-fig-text-brand shrink-0">
          <component :is="icon" />
        </n-icon>
        <span class="text-sm font-semibold text-fig-text-brand truncate">{{ title }}</span>
      </div>
      <slot name="trailing" />
    </div>

    <div class="profile-block__body">
      <slot />
      <div v-if="$slots.actions" class="flex items-start gap-4">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .profile-block {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 4px;
    border-radius: 32px;
    overflow: hidden;
    background: var(--fig-block-bg);
  }

  .profile-block__header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    flex-shrink: 0;
    padding: 8px 16px;
    border-radius: 28px 28px 4px 4px;
    background: var(--fig-block-header-bg);
    overflow: hidden;
  }

  .profile-block__body {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 20px;
    width: 100%;
    flex-shrink: 0;
    padding: 16px;
  }

  // Maketdagi naqsh kartadan tashqariga chiqadi va `overflow: hidden` bilan qirqiladi
  .profile-block__watermark {
    position: absolute;
    right: -113.37px;
    bottom: -159.24px;
    width: 378.371px;
    height: 422.237px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    img {
      width: 197.522px;
      height: 377.221px;
      transform: rotate(-144.94deg);
    }
  }
</style>
