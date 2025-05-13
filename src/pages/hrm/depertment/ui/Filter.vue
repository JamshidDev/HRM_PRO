<script setup>
import {UIPageFilter, UISelect} from "@/components/index.js"
import {useAccountStore, useComponentStore, useDepartmentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const componentStore = useComponentStore()
const accStore = useAccountStore()
const store = useDepartmentStore()

const onAdd = ()=>{
  if(accStore.checkAction(accStore.pn.hrDepartmentsWrite)) return

  store.resetForm()
  store._level()
  componentStore._departments()
  store.activeDeep = 1

  store.parentElement = null
  store.visibleType = true
  store.visible = true
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.level))
)


const onSearchEv = ()=>{
  if(accStore.checkAction(accStore.pn.hrDepartmentsWrite)) return

  store.params.page = 1
  store._index()
}

const filterEvent = ()=>{
  store.params.page = 1
  store._index()
}

const resetFilter = ()=>{
  store.params.organizations = []
  store.params.level = null
  filterEvent()
}

const onLevel = ()=>{
  if(store.levelList.length === 0){
    store._level()
  }
}

const onShow = () => {
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
}


</script>

<template>
  <UIPageFilter
      @onAdd="onAdd"
      @onSearch="onSearchEv"
      v-model:search="store.params.search"
      :searchLoading="store.loading"
      :filter-count="filterCount"
      @onClear="resetFilter"
      @show="onShow"
  >
    <template #filterContent>
      <div class="w-full grid grid-cols-12">
        <div class="col-span-12">
          <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('actionLog.table.structure')}}</label>
          <UISelect
              :options="componentStore.structureList"
              :modelV="store.params.organizations"
              @updateModel="(v)=>store.params.organizations=v"
              :checkedVal="store.structureCheck2"
              @updateCheck="(v)=>store.structureCheck2=v"
              :loading="componentStore.structureLoading"
              @onSubmit="filterEvent"
          />
        </div>
        <div class="col-span-12">
          <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{$t('departmentPage.form.level')}}</label>
          <n-select
              v-model:value="store.params.level"
              :options="store.levelList"
              label-field="name"
              value-field="id"
              :placeholder="$t('content.choose')"
              clearable
              @update:value="filterEvent"
              :loading="store.levelLoading"
              @focus="onLevel"
          />
        </div>

      </div>


    </template>

  </UIPageFilter>
</template>

<style scoped>

</style>