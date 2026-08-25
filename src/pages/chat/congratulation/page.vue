<script setup>
  import { UIPageContent } from '@components'
  import { Table, Filter, Cards, PreviewModal } from './ui'
  import { useCongratulationStore } from '@stores'

  const store = useCongratulationStore()

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <UIPageContent class="!h-full">
    <!-- `!h-full` global `.ui-page-content { height: 100dvh }` ni bosib o'tadi: 100dvh
         header balandligini hisobga olmagani uchun karta ekrandan pastga chiqib ketardi.
         Jadval `flex-1 min-h-0` ichida — shunda u qolgan joyni egallaydi va uning
         pagination footeri har doim sahifaning eng pastida qoladi, qatorlar esa
         jadval ichida scroll bo'ladi. -->
    <Cards class="shrink-0" />
    <Filter class="shrink-0" />
    <div class="flex-1 min-h-0">
      <Table />
    </div>
    <PreviewModal />
  </UIPageContent>
</template>
