<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useTaskStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useTaskStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const statusOptions = computed(() => [
    { label: t('task.status.created'), value: 1 },
    { label: t('task.status.in_progress'), value: 2 },
    { label: t('task.status.done'), value: 3 },
    { label: t('task.status.blocked'), value: 4 }
  ])

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.hrTasksRead)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.hrTasksWrite)) return
    store.resetForm()
    store.visibleType = true
    componentStore.workerList = []
    componentStore.workerParams.organization_id = null
    store.visible = true
  }

  const filterCount = computed(() => Number(Boolean(store.params.status)))

  const resetFilter = () => {
    store.params.status = null
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    @onAdd="onAdd"
    @onClear="resetFilter"
    :add-permission="accStore.pn.hrTasksWrite"
    :filter-count="filterCount"
    :search-loading="store.loading"
  >
    <template #filterContent>
      <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
        <div class="col-span-12">
          <label>{{ $t('task.table.status') }}</label>
          <n-select
            v-model:value="store.params.status"
            :options="statusOptions"
            label-field="label"
            value-field="value"
            clearable
            @update:value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>
