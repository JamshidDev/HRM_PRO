<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useAccountStore, useComponentStore, useDevicesStore} from "@/store/modules/index.js"
import {ArrowCircleDown12Regular, ArrowSync24Filled} from "@vicons/fluent"
import i18n from "@/i18n/index.js"

const t = i18n.global.t

const store = useDevicesStore()
const componentStore = useComponentStore()
const accStore = useAccountStore()

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

const onAdd = ()=>{
  store.isAdmin = true
  store.visibleType = true
  store.visible = true
}




const resetFilter = ()=>{
  store.params.search = null
  store.params.page = 1
  store.params.organizations = []
  store.params.status = null
  store.params.org_status = null
  store.params.attached = null
  store._index()
}

const isAdmin = accStore.checkPermission(accStore.pn.admin) || false

const filterEvent = ()=>{
  store.params.page = 1
  store._index()
}

const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}

const beforeShow = (v)=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
}

const statusOption = [
  {
    name:t('content.online'),
    id:'on'
  },
  {
    name:t('content.offline'),
    id:'off'
  },
]

const attachOption = [
  {
    name:t('content.attached'),
    id:'yes'
  },
  {
    name:t('content.noAttached'),
    id:'no'
  },
]

const orgOption = [
  {
    name:t('devices.attachedOrg'),
    id:'yes'
  },
  {
    name:t('devices.noAttachedOrg'),
    id:'no'
  },
]

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.status))
    + Number(Boolean(store.params.attached))
    + Number(Boolean(store.params.org_status)) )

</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    @onSearch="onSearch"
    :search-loading="store.loading"
    @onClear="resetFilter"
    :show-add-button="isAdmin"
    :filterCount="filterCount"
    @onAdd="onAdd"
    @show="beforeShow"
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
    <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.online') +'/'+ $t('content.offline') }}</label>
    <n-select
        clearable
        filterable
        v-model:value="store.params.status"
        :options="statusOption"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
    />

    <template v-if="isAdmin">
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('content.status')}}</label>
      <n-select
          clearable
          filterable
          v-model:value="store.params.attached"
          :options="attachOption"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('devices.orgStatus')}}</label>
      <n-select
          clearable
          filterable
          v-model:value="store.params.org_status"
          :options="orgOption"
          label-field="name"
          value-field="id"
          @update:value="filterEvent"
      />
    </template>

  </template>

  <template #filterAction>
    <div class="col-span-12 md:col-span-6 flex justify-end gap-2">
      <n-button type="success" @click="store._downloadReport()" :loading="store.downloading">
        {{$t('content.downloadReport')}}
        <template #icon>
          <ArrowCircleDown12Regular/>
        </template>
      </n-button>
      <n-button type="success" @click="store._downloadDevices()" :loading="store.downloading">
        {{$t('content.download')}}
        <template #icon>
          <ArrowCircleDown12Regular/>
        </template>
      </n-button>
      <n-button type="primary" @click="store._refreshDevice()" :loading="store.loading">
        {{$t('content.refresh')}}
        <template #icon>
          <ArrowSync24Filled/>
        </template>
      </n-button>
    </div>
  </template>
</UIPageFilter>
</template>
