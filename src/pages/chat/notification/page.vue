<script setup>
  import { UIPageContent } from '@components'
  import { useAccountStore, useNotificationStore } from '@stores'
  import { createFrom, LogTable } from './ui'

  const store = useNotificationStore()
  const accStore = useAccountStore()

  // Push yuborish `instructionsWrite` bilan gated (forma faqat huquq bo'lsa).
  const canSend = computed(() => accStore.checkAction(accStore.pn.instructionsWrite))
  const activeTab = ref('send')

  onMounted(() => {
    // Bildirishnomalar `instructions` slug'i bilan qo'riqlanadi.
    if (!accStore.checkAction(accStore.pn.instructions)) return
    if (!canSend.value) activeTab.value = 'logs'
    store.resetForm()
    store._push_logs()
  })
</script>

<template>
  <UIPageContent>
    <!-- Button-style (segment) tablar: Push yuborish + Loglar -->
    <n-tabs v-model:value="activeTab" type="segment" animated>
      <n-tab-pane v-if="canSend" name="send" :tab="$t('notificationPage.send')">
        <createFrom />
      </n-tab-pane>
      <n-tab-pane name="logs" :tab="$t('notificationPage.logs')">
        <LogTable />
      </n-tab-pane>
    </n-tabs>
  </UIPageContent>
</template>
