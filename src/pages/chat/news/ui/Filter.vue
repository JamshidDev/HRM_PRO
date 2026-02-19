<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import { useNewsStore } from '@/store/modules/index.js'
  import { useDebounce } from '@/utils/index.js'
  import { useRouter } from 'vue-router'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'

  const emit = defineEmits(['filter'])

  const store = useNewsStore()
  const router = useRouter()

  const debounceSearch = useDebounce(() => emit('filter'))

  const onAdd = () => router.push(Utils.routeChatPathMaker(`${AppPaths.News}/create`))
</script>

<template>
  <UIPageFilter
    :show-filter-button="false"
    :search-loading="store.loading"
    v-model:search="store.params.search"
    @onSearch="debounceSearch"
    @onAdd="onAdd"
  />
</template>
