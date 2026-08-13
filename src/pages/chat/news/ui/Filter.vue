<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import { useNewsStore } from '@/store/modules/index.js'
  import { useDebounce } from '@/utils/index.js'
  import { useRouter } from 'vue-router'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const emit = defineEmits(['filter'])

  const store = useNewsStore()
  const router = useRouter()

  const debounceSearch = useDebounce(() => emit('filter'))

  const onAdd = () => router.push(Utils.routeChatPathMaker(`${AppPaths.News}/create`))

  const statusOptions = computed(() => [
    { label: t('newsPage.statusDraft'), value: 0 },
    { label: t('newsPage.statusPublished'), value: 1 },
    { label: t('newsPage.statusArchived'), value: 2 }
  ])

  const filterCount = computed(() => Number(store.params.status !== null))

  const onFilterChange = () => emit('filter')

  const onFilterClear = () => {
    store.params.status = null
    onFilterChange()
  }
</script>

<template>
  <UIPageFilter
    :filter-count="filterCount"
    :search-loading="store.loading"
    v-model:search="store.params.search"
    @onSearch="debounceSearch"
    @onAdd="onAdd"
    @onClear="onFilterClear"
  >
    <template #filterContent>
      <label class="text-xs text-gray-500 mb-1 font-medium">{{ $t('content.status') }}</label>
      <n-select
        clearable
        v-model:value="store.params.status"
        :options="statusOptions"
        @update:value="onFilterChange"
      />
    </template>
  </UIPageFilter>
</template>
