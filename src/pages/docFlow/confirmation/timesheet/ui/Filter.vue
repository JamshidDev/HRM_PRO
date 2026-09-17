<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import { useAccountStore, useConfTimesheetStore } from '@/store/modules/index.js'

  const store = useConfTimesheetStore()
  const accStore = useAccountStore()

  const onSearch = () => {
    if (!accStore.checkAction(accStore.pn.confirmationTable)) return
    store.params.page = 1
    store._index()
  }

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  const filterCount = computed(() => Number(Boolean(store.params.organizations.length)))

  // Korxona ro'yxati — HR dagidek tuzilma daraxti EMAS: tabelchiga faqat
  // o'ziga biriktirilgan korxonalar keladi (odatda bitta).
  const beforeShow = () => store._organizations()

  const resetFilter = () => {
    store.params.organizations = []
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :show-add-button="false"
    :filter-count="filterCount"
    :search-loading="store.loading"
    @onSearch="onSearch"
    @show="beforeShow"
    @onClear="resetFilter"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">
        {{ $t('actionLog.table.structure') }}
      </label>
      <n-select
        v-model:value="store.params.organizations"
        :options="store.organizationOptions"
        :loading="store.organizationLoading"
        :placeholder="$t('content.workplace')"
        label-field="name"
        value-field="id"
        multiple
        clearable
        filterable
        @update:value="filterEvent"
      />
    </template>
  </UIPageFilter>
</template>
