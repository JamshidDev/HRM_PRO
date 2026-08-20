<script setup>
  import { UIPageContent, UIModal } from '@components'
  import { useAccountStore, useNotificationStore } from '@stores'
  import { createFrom, LogTable } from './ui'
  import { Add24Filled } from '@vicons/fluent'

  const store = useNotificationStore()
  const accStore = useAccountStore()

  // Push yuborish `instructionsWrite` bilan gated (tugma faqat huquq bo'lsa).
  const canSend = computed(() => accStore.checkAction(accStore.pn.instructionsWrite))

  onMounted(() => {
    // Bildirishnomalar `instructions` slug'i bilan qo'riqlanadi.
    if (!accStore.checkAction(accStore.pn.instructionsRead)) return
    store._push_logs()
  })
</script>

<template>
  <UIPageContent>
    <!-- Header: sarlavha + "Xabar" (qo'shish) tugmasi -->
    <div class="mb-4 flex items-center justify-between">
      <div class="text-lg font-semibold">{{ $t('notificationPage.name') }}</div>
      <n-button v-if="canSend" type="primary" @click="store.openForm()">
        <template #icon>
          <n-icon><Add24Filled /></n-icon>
        </template>
        Xabar
      </n-button>
    </div>

    <!-- History (full-width table) -->
    <LogTable />

    <!-- Xabar formasi — modal -->
    <UIModal
      :visible="store.formVisible"
      @update:visible="(v) => (store.formVisible = v)"
      :title="$t('notificationPage.create')"
      :width="760"
    >
      <createFrom />
    </UIModal>
  </UIPageContent>
</template>
