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

onMounted(()=>{
  if(universityStore.list.length === 0){
    universityStore._index()
  }
})

</script>

<template>
<UIPageContent>
  <UIPageFilter
      @onAdd="onAdd"
      :show-filter-button="false"
  />
  <Tabs/>
</UIPageContent>
</template>
