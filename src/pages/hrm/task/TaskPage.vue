<script setup>
  import { UIPageContent, UIModal } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import createForm from './ui/createForm.vue'
  import detail from './ui/detail.vue'
  import { useTaskStore, useAccountStore } from '@/store/modules/index.js'
  import { Dismiss24Regular } from '@vicons/fluent'

  const accStore = useAccountStore()
  const store = useTaskStore()

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrTasksRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />

    <!-- Yaratish / Tahrirlash (modal) -->
    <UIModal
      v-model:visible="store.visible"
      :title="store.visibleType ? $t('task.createTitle') : $t('task.updateTitle')"
      :width="520"
    >
      <createForm />
    </UIModal>

    <!-- Ko'rish (modal) — tablar header'da -->
    <UIModal v-model:visible="store.detailVisible" :width="620" height="82vh">
      <template #header>
        <div class="px-4 pt-3 pb-1">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-textColor1">{{ $t('task.detailTitle') }}</h3>
            <n-button quaternary circle size="small" @click="store.detailVisible = false">
              <template #icon><n-icon><Dismiss24Regular /></n-icon></template>
            </n-button>
          </div>
          <n-tabs v-model:value="store.detailTab" type="segment" size="small">
            <n-tab name="info" :tab="$t('task.info')" />
            <n-tab name="history" :tab="$t('task.history')" />
            <n-tab name="comments" :tab="$t('task.comments')" />
          </n-tabs>
        </div>
      </template>
      <detail />
    </UIModal>
  </UIPageContent>
</template>
