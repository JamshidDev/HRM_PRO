<script setup>
  import { useComponentStore, useTopicExamResultStore } from '@/store/modules/index.js'
  import { UIModal, UISelect } from '@/components/index.js'
  import UIHelper from '@/utils/UIHelper.js'

  const store = useTopicExamResultStore()
  const componentStore = useComponentStore()

  // Mavzu o'zgarsa imtihon ro'yxati shu mavzular bo'yicha qayta yuklanadi.
  const onChangeTopic = (v) => {
    store.downloadParams.exams = []
    store.downloadExamList = []
    if (Array.isArray(v) && v.length === 0) return
    store._downloadExamOptions(v?.toString())
  }
</script>

<template>
  <UIModal
    v-model:visible="store.downloadVisible"
    :title="$t('examPage.downloadTitle')"
    :width="480"
  >
    <div class="flex flex-col">
      <n-tabs v-model:value="store.downloadParams.type" type="segment" size="small">
        <n-tab name="results">{{ $t('examPage.downloadResult') }}</n-tab>
        <n-tab name="notPassed">{{ $t('examPage.downloadNotPassed') }}</n-tab>
      </n-tabs>

      <label class="text-xs mt-4 text-gray-500 mb-1 font-medium">{{
        $t('actionLog.table.structure')
      }}</label>
      <UISelect
        placement="bottom-start"
        :options="componentStore.structureList"
        :modelV="store.downloadParams.organizations"
        @defaultValue="(v) => (store.downloadParams.organizations = v)"
        @updateModel="(v) => (store.downloadParams.organizations = v)"
        :checkedVal="store.downloadStructureCheck"
        @updateCheck="(v) => (store.downloadStructureCheck = v)"
        :loading="componentStore.structureLoading"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
      />

      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{ $t('examPage.topic') }}</label>
      <n-select
        class="w-full"
        clearable
        multiple
        v-model:value="store.downloadParams.topics"
        :options="store.topicList"
        label-field="name"
        value-field="id"
        :render-label="UIHelper.selectRender.label"
        :render-tag="UIHelper.selectRender.value"
        @update:value="onChangeTopic"
        :loading="store.topicLoading"
        :max-tag-count="1"
      />

      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{ $t('examPage.exam') }}</label>
      <n-select
        :disabled="store.downloadParams.topics.length === 0"
        class="w-full"
        clearable
        multiple
        v-model:value="store.downloadParams.exams"
        :options="store.downloadExamList"
        label-field="name"
        value-field="id"
        :render-label="UIHelper.selectRender.label"
        :render-tag="UIHelper.selectRender.value"
        :loading="store.downloadExamLoading"
        :max-tag-count="1"
      />

      <div class="grid grid-cols-2 gap-2 mt-8">
        <n-button @click="store.downloadVisible = false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          v-fly-upload
          type="primary"
          :loading="store.downloadLoading"
          @click="store._downloadSubmit()"
        >
          {{ $t('content.download') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
