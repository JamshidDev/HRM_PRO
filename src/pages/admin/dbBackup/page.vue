<script setup>
  /**
   * Baza zaxira nusxalari — FAQAT KO'RISH.
   *
   * Yuklab olish tugmasi ATAYLAB yo'q (qaror 2026-08-15): to'liq dump ~90k
   * xodimning shaxsiy ma'lumoti — JSHSHIR, pasport, parol hashlari, sessiya
   * tokenlari. Uni HTTP orqali ochish xavf maydonini SSH'dan admin sessiyasiga
   * ko'chiradi (token localStorage'da → panelning istalgan XSS'i butun bazaga
   * teng bo'lardi). Faylni serverdan `scp` bilan olinadi.
   */
  import { UIPageContent } from '@components'
  import { useAccountStore, useDbBackupStore } from '@stores'
  import StatusCards from './ui/StatusCards.vue'
  import Table from './ui/Table.vue'

  const store = useDbBackupStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.dbBackupRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <StatusCards />
    <Table />
  </UIPageContent>
</template>
