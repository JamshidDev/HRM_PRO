<script setup>
  import { onMounted } from 'vue'
  import { UIDrawer, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileStoryStore()

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      v-model:search="store.params.search"
      @on-search="onSearch"
      :search-loading="store.loading"
      @on-add="onAdd"
      :show-filter-button="false"
    />
    <Table />
    <UIDrawer
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.visibleType ? t('mobileStoryPage.createTitle') : t('mobileStoryPage.updateTitle')"
    >
      <template #content>
        <createForm />
      </template>
    </UIDrawer>
  </UIPageContent>
</template>

<style scoped></style>
