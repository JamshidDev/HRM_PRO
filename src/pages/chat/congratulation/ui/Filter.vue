<script setup>

import {useCongratulationStore, useComponentStore} from "@stores"
import {UIPageFilter} from "@components"
import {useAppSetting} from "@utils"

const store = useCongratulationStore()
const componentStore = useComponentStore()

const onSearch = () => {
  store.params.page = 1
  store._index()
}

const filterEvent = () => {
  store.params.page = 1
  store._index()
}

const filterCount = computed(() => Number(Boolean(store.params.date))+Number(Boolean(store.params.type)))
const resetFilter = () => {
  store.params.date = null
  store.params.type = null
  filterEvent()
}

const fetchChatEnums = () => {
  if(componentStore.chatEnums?.length) return
  componentStore.fetchChatEnums()
}

const onShow = (v) =>{
  if(!v) return
  fetchChatEnums()
}
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="onSearch"
    :show-add-button="false"
    :filter-count="filterCount"
    @onClear="resetFilter"
    @show="onShow"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('content.type')
      }}</label>
      <n-select
        clearable
        filterable
        v-model:value="store.params.type"
        :options="componentStore.chatEnums"
        :loading="componentStore.chatEnumLoading"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500">{{ $t('content.date') }}</label>
      <n-date-picker
        class="mt-1"
        v-model:value="store.params.date"
        @update:value="filterEvent"
        type="date"
        :actions="null"
        :format="useAppSetting.datePicketFormat"
        clearable
      />
    </template>
  </UIPageFilter>
</template>
