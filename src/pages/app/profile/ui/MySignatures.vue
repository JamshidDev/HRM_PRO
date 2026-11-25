<script setup>
  // Profil «Imzolar tarixi» — foydalanuvchining o'z imzolari (admin jadvali va tafsilot oynasi qayta ishlatiladi).
  import { useSignatureHistoryStore } from '@/store/modules/index.js'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import Table from '@/pages/admin/signatureHistory/ui/Table.vue'
  import DetailDrawer from '@/pages/admin/signatureHistory/ui/DetailDrawer.vue'
  import FileEditIcon from '@/assets/icons/fileEdit.svg'

  const store = useSignatureHistoryStore()

  onMounted(() => {
    store.setScope('own')
    store._index()
  })
  onBeforeUnmount(() => store.setScope('admin'))
</script>

<template>
  <SectionHeader :title="$t('profilePage.tabs.signatures')" :icon="FileEditIcon" large>
    <Table />
  </SectionHeader>
  <DetailDrawer />
</template>
