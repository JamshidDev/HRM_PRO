<script setup>
import {TimePicker24Filled, ArrowCircleDown24Regular} from "@vicons/fluent";
import {
  useAccountStore,
  useComponentStore,
  useTopicExamResultStore
} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
import UIHelper from "@/utils/UIHelper.js"

const store = useTopicExamResultStore()
const accStore = useAccountStore()

const filterEvent = ()=>{
  store.params.page = 1
  store._index()
}

const componentStore = useComponentStore()

const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}

const beforeShow = (v)=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }

  if(store.topicList.length === 0){
    store._topic()
  }
}

const resetFilter = ()=>{
  store.params.organizations = []
  store.params.topics = []
  store.params.exams = []
  store.params.deleted_at = false
  filterEvent()
}

const onChange = (v)=>{
  store.params.deleted_at = v
  filterEvent()
}

const onChangeTopic = (v)=>{
  store.params.exams = []
  filterEvent()
  if(Array.isArray(v) && v.length ===0) return
  store._exam(v?.toString())

}

const filterCount = computed(()=>Number(Boolean(store.params.organizations?.length)) + Number(Boolean(store.params.topics.length))+ Number(Boolean(store.params.exams.length)) +Number(Boolean(store.params.deleted_at)))


const accessFinishBtn = computed(()=>accStore.checkPermission(accStore.pn.admin))
</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :search-loading="store.loading"
      @onSearch="filterEvent"
      :show-add-button="false"
      @show="beforeShow"
      :filter-count="filterCount"
      @onClear="resetFilter"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
      <UISelect
          :options="componentStore.structureList"
          :modelV="store.params.organizations"
          @defaultValue="(v)=>store.params.organizations=v"
          @updateModel="onChangeStructure"
          :checkedVal="store.structureCheck2"
          @updateCheck="(v)=>store.structureCheck2=v"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          @onSubmit="filterEvent"
      />
      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{$t('examPage.topic')}}</label>
      <n-select
          class="w-full max-w-[370px]"
          clearable
          multiple
          v-model:value="store.params.topics"
          :options="store.topicList"
          label-field="name"
          value-field="id"
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
          @update:value="onChangeTopic"
          :loading="store.topicLoading"
          :max-tag-count="1"
      />
      <label class="text-xs mt-3 text-gray-500 mb-1 font-medium">{{$t('examPage.exam')}}</label>
      <n-select
          :disabled="store.params.topics.length === 0"
          class="w-full max-w-[370px]"
          clearable
          multiple
          v-model:value="store.params.exams"
          :options="store.examList"
          label-field="name"
          value-field="id"
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
          @update:value="filterEvent"
          :loading="store.examLoading"
          :max-tag-count="1"
      />
      <div @click.self="onChange(!store.params.deleted_at)" class="flex cursor-pointer py-1 px-3 border rounded-lg mt-4 border-surface-line">
        <n-checkbox @update:checked="onChange" v-model:checked="store.params.deleted_at" >
          <p class="line-clamp-1">{{$t('examPage.showDeleted')}}</p>
        </n-checkbox>
      </div>

    </template>
    <template #filterAction>
      <template v-if="accessFinishBtn">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button type="error" :loading="store.loading" @click="store._finishExam()">
              <template #icon>
                <n-icon size="24">
                  <TimePicker24Filled/>
                </n-icon>
              </template>
              {{$t('examPage.finishedProcess')}}
            </n-button>
          </template>
          {{$t('examPage.finishedDescription')}}
        </n-tooltip>
      </template>

      <n-button v-fly-upload type="success" :loading="store.downloadLoading || store.loading" @click="store._downloadExam()">
        <template #icon>
          <n-icon size="24">
            <ArrowCircleDown24Regular/>
          </n-icon>
        </template>
        {{$t('examPage.downloadResult')}}
      </n-button>
      <n-button v-fly-upload type="warning" :loading="store.downloadLoading || store.loading" @click="store._downloadNotPassedExam()">
        <template #icon>
          <n-icon size="24">
            <ArrowCircleDown24Regular/>
          </n-icon>
        </template>
        {{$t('examPage.downloadNotPassed')}}
      </n-button>
    </template>
  </UIPageFilter>
</template>