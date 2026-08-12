<script setup>
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import {
    useConfirmationStore,
    useComponentStore,
    useAccountStore
  } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import createFrom from './ui/createForm.vue'
  import Filter from './ui/Filter.vue'

  const store = useConfirmationStore()
  const compStore = useComponentStore()
  const accStore = useAccountStore()
  const createFormRef = ref(null)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrConfirmationsRead)) return
    store._index()
  })

  onUnmounted(() => {
    compStore.clearCache()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="
        store.visibleType ? $t('confirmationPage.createTitle') : $t('confirmationPage.updateTitle')
      "
      width="min(700px, calc(100vw - 32px))"
    >
      <createFrom ref="createFormRef" />

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
