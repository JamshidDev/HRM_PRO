<script setup>
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
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

  // Saqlash/Bekor qilish tugmalari modal footer'ida turadi, forma esa faqat
  // validatsiyani biladi.
  const formRef = ref(null)

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
      :add-permission="accStore.pn.examCategoriesWrite"
      :show-filter-button="false"
      v-model:search="store.params.search"
      :search-loading="store.loading"
      @onSearch="onSearch"
      @onAdd="onAdd"
    />
    <Table />
    <UIModal
      v-model:visible="store.visible"
      :title="
        store.visibleType ? $t('categoryPage.createCategory') : $t('categoryPage.editCategory')
      "
      width="min(560px, calc(100vw - 32px))"
    >
      <Form ref="formRef" />
      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            @click="formRef?.submit()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
    <UIModal
      :width="'90%'"
      v-model:visible="categoryQuestionStore.excelVisible"
      :title="$t('categoryPage.uploadExcel')"
    >
      <UploadExcel />
    </UIModal>
  </UIPageContent>
</template>
