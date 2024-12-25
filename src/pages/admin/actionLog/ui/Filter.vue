<script setup>
import {UIPageFilter, UIStructure} from "@/components/index.js"
import {useComponentStore, useActionLogStore} from "@/store/modules/index.js"
const compStore = useComponentStore()
const store = useActionLogStore()

const filterCount = computed(()=>{
  return Number(Boolean(store.params.organizations.length)) + Number(Boolean(store.params.created_at))
      + Number(Boolean(store.params.subject_type)) + Number(Boolean(store.params.description))
})

const onClear = ()=>{
  store.params.organizations = []
  store.params.created_at = null
  store.params.subject_type = null
  store.params.description = null
}


onMounted(()=>{
  store._getActionLog()
})
</script>

<template>
  <UIPageFilter
      :show-add-button="false"
      :filterCount="filterCount"
      @onClear="onClear"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500">{{$t('actionLog.table.structure')}}</label>
      <UIStructure
          :modelV="store.params.organizations"
          @updateModel="(v)=>store.params.organizations=v"
          :checkedVal="store.structureCheck"
          @updateCheck="(v)=>store.structureCheck=v"
      />
      <label class="mt-3 text-xs text-gray-500">{{$t('content.date')}}</label>
      <n-date-picker clearable v-model:value="store.params.created_at" type="date" :placeholder="$t('content.choose')" />
      <label class="mt-3 text-xs text-gray-500">{{$t('actionLog.table.status')}}</label>
      <n-select
          v-model:value="store.params.description"
          :options="compStore.logStatusList"
          label-field="name"
          value-field="id"
          :placeholder="$t('content.choose')"
          clearable
      />
      <label class="mt-3 text-xs text-gray-500">{{$t('actionLog.status.subject_type')}}</label>
      <n-input v-model:value="store.params.subject_type" type="text" :placeholder="$t('content.enterField')" />

    </template>
  </UIPageFilter>
</template>

<style scoped>

</style>