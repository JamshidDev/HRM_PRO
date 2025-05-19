<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import Tabs from "./ui/Tabs.vue"

import {useLanguageAdminStore, useUniversityAdminStore, useSpecialityStore} from "@/store/modules/index.js"
const store = useLanguageAdminStore()
const universityStore = useUniversityAdminStore()
const specialtyStore = useSpecialityStore()

const onAdd = ()=>{
  if(store.activeTab === 3){
    addLanguage()
  }else if(store.activeTab === 1){
    addUniversity()
  }else if(store.activeTab === 2){
    addSpecialty()
  }
}

const onSearch = ()=>{
  if(store.activeTab === 3){
    store.params.search = universityStore.params.search
   store.params.page = 1
    store._index()
  }else if(store.activeTab === 1){
    universityStore.params.page = 1
    universityStore._index()
  }else if(store.activeTab === 2){
    specialtyStore.params.search = universityStore.params.search
    specialtyStore.params.page = 1
    specialtyStore._index()
  }

}

const addLanguage =()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const addUniversity =()=>{
  universityStore.resetForm()
  universityStore.visibleType = true
  universityStore.visible = true
}

const addSpecialty =()=>{
  specialtyStore.resetForm()
  specialtyStore.visibleType = true
  specialtyStore.visible = true
}


</script>

<template>
<UIPageContent>
  <UIPageFilter
      v-model:search="universityStore.params.search"
      @onSearch="onSearch"
      @onAdd="onAdd"
      :show-filter-button="false"
  />
  <Tabs/>
</UIPageContent>
</template>
