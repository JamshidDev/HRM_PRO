<script setup>
  import watermarkUrl from '@/assets/icons/figBlockWatermark.svg?url'

  /**
   * Figma "Block" (node 2609:73390 / 3132:61807) — xodim profili va kandidat qo'shish
   * sahifasidagi barcha kartalar shu qolipda.
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
  <div class="fig-block">
    <div v-if="watermark" class="fig-block__watermark" aria-hidden="true">
      <img :src="watermarkUrl" alt="" />
    </div>

    <div class="fig-block__header">
      <div class="flex flex-1 min-w-0 items-center gap-2">
        <n-icon v-if="icon" :size="20" class="text-fig-text-brand shrink-0">
          <component :is="icon" />
        </n-icon>
        <span class="text-sm font-semibold text-fig-text-brand truncate">{{ title }}</span>
      </div>
      <slot name="trailing" />
    </div>

    <div class="fig-block__body">
      <slot />
      <div v-if="$slots.actions" class="flex items-start justify-end gap-4">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .fig-block {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 4px;
    border-radius: 32px;
    overflow: hidden;
    background: var(--fig-block-bg);
  }

  .fig-block__header {
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

  // `align-items: flex-end` edi — `w-full` bermagan har qanday bola element
  // kengligini yo'qotib o'ng chetga yopishib qolardi. Amallar qatori esa
  // o'zining `justify-end` i bilan maketdagidek o'ngda turaveradi.
  .fig-block__body {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: 20px;
    width: 100%;
    flex-shrink: 0;
    padding: 16px;
  }

  /*
    Figma "List" (node 3132:61815) — blok ichidagi maydonlar to'ri.
    Global emas, blokning o'zi bilan birga yuklanadi: bloklardan foydalanadigan
    har bir sahifa (xodim profili, kandidat qo'shish, shartnoma oynasi) uni
    qo'shimcha import qilmasdan oladi.
  */
  .fig-block__body :deep(.fig-grid) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: start;
    gap: 12px;
    width: 100%;
  }

  .fig-block__body :deep(.fig-grid > .fig-grid__wide) {
    grid-column: span 2;
  }

  .fig-block__body :deep(.fig-grid > .fig-grid__full) {
    grid-column: 1 / -1;
  }

  .fig-block__body :deep(.fig-separator) {
    width: 100%;
    height: 1px;
    border-radius: 9999px;
    background: var(--fig-br-disable);
  }

  .fig-block__body :deep(.fig-group-title) {
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    color: var(--fig-text-primary);
  }

  @media (max-width: 976px) {
    .fig-block__body :deep(.fig-grid) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .fig-block__body :deep(.fig-grid) {
      grid-template-columns: minmax(0, 1fr);
    }

    .fig-block__body :deep(.fig-grid > .fig-grid__wide),
    .fig-block__body :deep(.fig-grid > .fig-grid__full) {
      grid-column: span 1;
    }
  }

  // Maketdagi naqsh kartadan tashqariga chiqadi va `overflow: hidden` bilan qirqiladi
  .fig-block__watermark {
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
