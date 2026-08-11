<script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useMobileStoryStore()
  const router = useRouter()

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    router.push(Utils.routeChatPathMaker(`${AppPaths.MobileStories}/create`))
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
  </UIPageContent>
</template>

<style scoped></style>
