<script setup>
  import { useAccountStore, useComponentStore, useLmsLessonStore } from '@/store/modules/index.js'
  import { UIPageFilter, UISelect } from '@/components/index.js'
  import UIHelper from '@/utils/UIHelper.js'

  const store = useLmsLessonStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  // «Natijalar» sahifasi ruxsati — navigations.js bilan bir xil slug.
  const filterEvent = () => {
    if (!accStore.canView(accStore.pn.lmsResultRead)) return
    store.resultParams.page = 1
    store._resultIndex()
  }

  const onChangeStructure = (v) => {
    store.resultParams.organizations = v
    filterEvent()
  }

  // Mavzu almashsa imtihon tanlovi bekor qilinadi — eski mavzudagi imtihon
  // qolib ketsa ro'yxat bo'sh natija berardi.
  const onChangeTopic = (v) => {
    store.resultParams.exams = []
    filterEvent()
    if (Array.isArray(v) && v.length === 0) return
    store._resultExams(v?.toString())
  }

  const beforeShow = () => {
    if (componentStore.structureList.length === 0) componentStore._structures()
    if (store.resultTopicList.length === 0) store._resultTopics()
  }

  const resetFilter = () => {
    store.resultParams.organizations = []
    store.resultParams.topics = []
    store.resultParams.exams = []
    store.resultStructureCheck = []
    filterEvent()
  }

  const filterCount = computed(
    () =>
      Number(Boolean(store.resultParams.organizations?.length)) +
      Number(Boolean(store.resultParams.topics?.length)) +
      Number(Boolean(store.resultParams.exams?.length))
  )
</script>

<template>
  <UIPageFilter
    v-model:search="store.resultParams.search"
    :search-loading="store.resultLoading"
    @onSearch="filterEvent"
    :show-add-button="false"
    @show="beforeShow"
    :filter-count="filterCount"
    @onClear="resetFilter"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.resultParams.organizations"
        @defaultValue="(v) => (store.resultParams.organizations = v)"
        @updateModel="onChangeStructure"
        :checkedVal="store.resultStructureCheck"
        @updateCheck="(v) => (store.resultStructureCheck = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        @onSubmit="filterEvent"
      />
      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{ $t('examPage.topic') }}</label>
      <n-select
        class="w-full"
        clearable
        multiple
        v-model:value="store.resultParams.topics"
        :options="store.resultTopicList"
        label-field="name"
        value-field="id"
        :render-label="UIHelper.selectRender.label"
        :render-tag="UIHelper.selectRender.value"
        @update:value="onChangeTopic"
        :loading="store.resultTopicLoading"
        :max-tag-count="1"
      />
      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{ $t('examPage.exam') }}</label>
      <n-select
        :disabled="store.resultParams.topics.length === 0"
        class="w-full"
        clearable
        multiple
        v-model:value="store.resultParams.exams"
        :options="store.resultExamList"
        label-field="name"
        value-field="id"
        :render-label="UIHelper.selectRender.label"
        :render-tag="UIHelper.selectRender.value"
        @update:value="filterEvent"
        :loading="store.resultExamLoading"
        :max-tag-count="1"
      />
    </template>
  </UIPageFilter>
</template>
