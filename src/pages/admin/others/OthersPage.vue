<script setup>
import {UIPageContent, UIPageFilter} from "@/components/index.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

import Tabs from "./ui/Tabs.vue"

import {useLanguageAdminStore, useUniversityAdminStore, useSpecialityStore} from "@/store/modules/index.js"
const store = useLanguageAdminStore()
const universityStore = useUniversityAdminStore()
const specialtyStore = useSpecialityStore()

const onAdd = ()=>{
  if(store.activeTab === 3){
    if(!accStore.checkAction(accStore.pn.languagesWrite)) return
    addLanguage()
  }else if(store.activeTab === 1){
    if(!accStore.checkAction(accStore.pn.universitiesWrite)) return
    addUniversity()
  }else if(store.activeTab === 2){
    if(!accStore.checkAction(accStore.pn.specialitiesWrite)) return
    addSpecialty()
  }
}

const onSearch = ()=>{
  if(store.activeTab === 3){
    if(!accStore.checkAction(accStore.pn.languagesRead)) return
    store.params.search = universityStore.params.search
   store.params.page = 1
    store._index()
  }else if(store.activeTab === 1){
    if(!accStore.checkAction(accStore.pn.universitiesRead)) return
    universityStore.params.page = 1
    universityStore._index()
  }else if(store.activeTab === 2){
    if(!accStore.checkAction(accStore.pn.specialitiesRead)) return
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
