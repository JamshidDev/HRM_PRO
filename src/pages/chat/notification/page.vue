<script setup>
  import { UIModal, UIPageContent } from '@components'
  import { useAccountStore, useNotificationStore } from '@stores'
  import { createFrom, Table, Filter } from './ui'

  const store = useNotificationStore()
  const accStore = useAccountStore()

  onMounted(() => {
    // Bildirishnomalar `instructions` slug'i bilan qo'riqlanadi — navigations.js,
    // rol formasidagi "Bildirishnomalar" guruhi va backend ENFORCED ro'yxati
    // shunga tayanadi. Bu yerda `chat-notification` tekshirilardi: admin
    // "Bildirishnomalar"ni bersa menyu chiqar, lekin sahifa bo'sh qolib
    // "Ruxsat etilmadi" toasti chiqardi.
    if (!accStore.checkAction(accStore.pn.instructions)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      :width="800"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="$t('notificationPage.create')"
    >
      <createFrom />
    </UIModal>
  </UIPageContent>
</template>
