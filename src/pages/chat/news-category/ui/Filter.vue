<script setup>
  import { appPermissions } from '@/utils/index.js'
  import { UIPageFilter } from '@/components/index.js'
  import { useNewsCategoryStore } from '@/store/modules/index.js'

  const store = useNewsCategoryStore()

  const onAdd = () => {
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    :show-add-button="true"
    :show-filter-button="false"
    @onSearch="onSearch"
    :add-permission="appPermissions.chatNewsCategoriesWrite"
    @onAdd="onAdd"
  />
</template>
