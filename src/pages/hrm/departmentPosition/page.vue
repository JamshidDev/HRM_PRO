<script setup>
  import { UIModal, UIPageContent } from '@components'
  import { useDepartmentPositionStore, useAccountStore } from '@stores'
  import { createFrom, Table, Filter, Preview, SalaryHistoryModal } from './ui'

  const store = useDepartmentPositionStore()
  const accStore = useAccountStore()
  const createFormRef = ref(null)

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrPositionsRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="
        store.visibleType
          ? $t('departmentPositionPage.createTitle')
          : $t('departmentPositionPage.updateTitle')
      "
      width="min(1000px, calc(100vw - 32px))"
      height="min(85vh, 720px)"
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
    <Preview />
    <UIModal
      :width="'860px'"
      :visible="store.salaryHistory.visible"
      @update:visible="(v) => (store.salaryHistory.visible = v)"
      :title="$t('departmentPositionPage.salaryHistory.title')"
    >
      <SalaryHistoryModal />
    </UIModal>
  </UIPageContent>
</template>
