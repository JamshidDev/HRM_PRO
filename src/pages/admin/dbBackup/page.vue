<script setup>
  /**
   * Baza zaxira nusxalari — FAQAT KO'RISH.
   *
   * Zaxira FAQAT tizim jadvali (cron) orqali olinadi — paneldan qo'lda dump
   * boshlash olib tashlandi (qaror 2026-08-15). Sahifada boshqaruv yo'q:
   * bu jurnal, panel emas.
   *
   * Yuklab olish tugmasi ham ATAYLAB yo'q: to'liq dump ~90k xodimning shaxsiy
   * ma'lumoti — JSHSHIR, pasport, parol hashlari, sessiya tokenlari. Uni HTTP
   * orqali ochish xavf maydonini SSH'dan admin sessiyasiga ko'chiradi (token
   * localStorage'da → panelning istalgan XSS'i butun bazaga teng bo'lardi).
   * Faylni serverdan `scp` bilan olinadi.
   */
  import { UIPageContent } from '@components'
  import { useAccountStore, useDbBackupStore } from '@stores'
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
    <Table />
  </UIPageContent>
</template>
