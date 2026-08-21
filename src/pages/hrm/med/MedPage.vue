<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useMedStore } from '@/store/modules/index.js'
  import createForm from './ui/createForm.vue'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'

  const store = useMedStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const createFormRef = ref(null)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrMedRead)) return
    store._index()
  })

  onUnmounted(() => {
    componentStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="store.visibleType ? $t('medPage.createTitle') : $t('medPage.updateTitle')"
      width="min(700px, calc(100vw - 32px))"
      height="min(85vh, 800px)"
    >
      <createForm ref="createFormRef" />

      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            @click="createFormRef?.submit()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>

<style scoped></style>
