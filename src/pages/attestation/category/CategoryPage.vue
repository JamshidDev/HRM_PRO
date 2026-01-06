<script setup>
  import { UIDrawer, UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Form from './ui/Form.vue'
  import UploadExcel from './categoryQuestion/ui/UploadExcel.vue'
  import {
    useAccountStore,
    useCategoryStore,
    useCategoryQuestionStore
  } from '@/store/modules/index.js'

  const store = useCategoryStore()
  const categoryQuestionStore = useCategoryQuestionStore()
  const accStore = useAccountStore()

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.examCategoriesRead)) return

    store.params.page = 1
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.examCategoriesRead)) return
    store.params.page = 1
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :show-search-input="false"
      v-model:search="store.params.search"
      @onSearch="onSearch"
      @onAdd="onAdd"
    />
    <Table />
    <!--    That is a good category    -->
    <UIDrawer
      :width="300"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="
        store.visibleType ? $t('categoryPage.createCategory') : $t('categoryPage.editCategory')
      "
    >
      <template #content>
        <Form />
      </template>
    </UIDrawer>
    <UIModal
      :width="'90%'"
      :visible="categoryQuestionStore.excelVisible"
      @update:visible="(v) => (categoryQuestionStore.excelVisible = v)"
      :title="$t('categoryPage.uploadExcel')"
    >
      <UploadExcel />
    </UIModal>
  </UIPageContent>
</template>
