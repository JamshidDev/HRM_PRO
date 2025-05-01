<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useComponentStore, useActionLogStore} from "@/store/modules/index.js"
import {useDebounceFn} from "@vueuse/core"
const compStore = useComponentStore()
const store = useActionLogStore()

const filterCount = computed(()=>{
  if(store.activeTab === 1){
    return Number(Boolean(store.params.organizations.length)) + Number(Boolean(store.params.created_at))
        + Number(Boolean(store.params.subject_type)) + Number(Boolean(store.params.description))
  }else{
    return Number(Boolean(store.params.organizations.length)) + Number(Boolean(store.params.login_at))
        + Number(Boolean(store.params.ip_address))
  }

})

const onClear = ()=>{
  store.params.organizations = []
  store.params.created_at = null
  store.params.subject_type = null
  store.params.description = null
  filterEvent()
}

const onSearchEv = useDebounceFn(() => {
  filterEvent()
}, 300, )


const filterEvent = ()=>{
  if(store.activeTab === 1){
    store.params.page = 1
    store._getActionLog()
  }else{
    store._getAuthLog()
  }
}



const onShow = () => {
  if(compStore.structureList.length === 0){
    compStore._structures()
  }
}

onMounted(()=>{
  store._getActionLog()
})
</script>

<template>
  <UIPageFilter
      @show="onShow"
      v-model:search="store.params.search"
      :show-add-button="false"
      :filterCount="filterCount"
      :search-loading="store.loading"
      @onClear="onClear"
      @onSearch="filterEvent"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500">{{$t('actionLog.table.structure')}}</label>
      <UISelect
          :options="compStore.structureList"
          :modelV="store.params.organizations"
          @updateModel="(v)=>store.params.organizations=v"
          :checkedVal="store.structureCheck"
          @updateCheck="(v)=>store.structureCheck=v"
          :loading="compStore.structureLoading"
          @onSubmit="filterEvent"
      />
      <template v-if="store.activeTab === 1">
        <label class="mt-3 text-xs text-gray-500">{{$t('content.date')}}</label>
        <n-date-picker clearable v-model:value="store.params.created_at" type="date"
                       @update:value="filterEvent" :placeholder="$t('content.choose')" />
      </template>
      <template v-if="store.activeTab === 1">
        <label class="mt-3 text-xs text-gray-500">{{$t('actionLog.table.status')}}</label>
        <n-select
            v-model:value="store.params.description"
            :options="compStore.logStatusList"
            label-field="name"
            value-field="id"
            :placeholder="$t('content.choose')"
            clearable
            @update:value="filterEvent"
        />
      </template>
      <template v-if="store.activeTab === 1">
        <label class="mt-3 text-xs text-gray-500">{{$t('actionLog.status.subject_type')}}</label>
        <n-input v-model:value="store.params.subject_type"  :on-keyup="onSearchEv" type="text" :placeholder="$t('content.enterField')" />
      </template>
      <template v-if="store.activeTab === 2">
        <label class="mt-3 text-xs text-gray-500">{{$t('actionLog.table.ip')}}</label>
        <n-input v-model:value="store.params.ip_address"  :on-keyup="onSearchEv" type="text" :placeholder="$t('content.enterField')" />
      </template>
      <template v-if="store.activeTab === 2">
        <label class="mt-3 text-xs text-gray-500">{{$t('actionLog.table.loginAt')}}</label>
        <n-date-picker clearable v-model:value="store.params.login_at" type="date" @update:value="filterEvent" :placeholder="$t('content.choose')" />
      </template>
    </template>
  </UIPageFilter>
</template>

<style scoped>

</style>