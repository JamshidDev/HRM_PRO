<script setup>
import {useAccountStore, useComponentStore, useLmsGroupStore} from "@/store/modules/index.js"
import {UIPageFilter, UISelect} from "@/components/index.js"
const store = useLmsGroupStore()
const accStore = useAccountStore()
const componentStore = useComponentStore()

const filterEvent = ()=>{
  store.params.page = 1
  store._index()
}



const onChangeStructure = (v)=>{
  store.params.organizations=v
  filterEvent()
}




const resetFilter = ()=>{
  store.params.organizations = []
  store.params.name = null
  store.params.learning_center_id = null
  filterEvent()
}

const filterCount = computed(()=>Number(Boolean(store.params.organizations.length))
    + Number(Boolean(store.params.name))
    + Number(Boolean(store.params.learning_center_id)))

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}


onMounted(()=>{
  if(componentStore.structureList.length === 0){
    componentStore._structures()
  }
})

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :search-loading="store.loading"
      @onSearch="filterEvent"
      :filter-count="filterCount"
      @onClear="resetFilter"
      @onAdd="onAdd"
      :show-filter-button="false"
  >
  </UIPageFilter>
</template>