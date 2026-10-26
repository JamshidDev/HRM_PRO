<script setup>
  import { UIDrawer, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { usePageInstructionStore, useAccountStore } from '@/store/modules/index.js'
  // Yo'riqnoma formasi sahifa ichidagi tahrirlagich bilan bitta (rasm, matn, menyu).
  import InstructionForm from '@/components/pageInstruction/createForm.vue'
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global

  const accStore = useAccountStore()
  const store = usePageInstructionStore()

  const onSearch = (v) => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.instructionsWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.instructionsRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :add-permission="accStore.pn.instructionsWrite"
      v-model:search="store.params.search"
      @on-search="onSearch"
      :search-loading="store.loading"
      @on-add="onAdd"
      :show-filter-button="false"
      :show-add-button="false"
    />
    <Table />
    <UIDrawer :width="1000" v-model:visible="store.visible" :title="t('content.edit')">
      <template #content>
        <InstructionForm />
      </template>
    </UIDrawer>
  </UIPageContent>
</template>
