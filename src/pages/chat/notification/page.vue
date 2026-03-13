<script setup>
  import { UIModal, UIPageContent } from '@components'
  import { useAccountStore, useNotificationStore } from '@stores'
  import { createFrom, Table, Filter } from './ui'

  const store = useNotificationStore()
  const accStore = useAccountStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.chatNotification)) return
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
