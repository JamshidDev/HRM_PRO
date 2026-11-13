<script setup>
  // «Hujjat namunalari» — korxona xizmatlari; shablonlar endi umumiy («Shablon» sahifasi).
  import { UIPageContent } from '@/components/index.js'
  import Tabs from './ui/Tabs.vue'
  import { useAccountStore } from '@/store/modules/index.js'

  const accStore = useAccountStore()

  onMounted(() => {
    accStore.checkAction(accStore.pn.documentExamplesRead)
  })
</script>

<template>
  <UIPageContent>
    <Tabs />
  </UIPageContent>
</template>
