<script setup>
import {useLanguageAdminStore} from "@/store/modules/admin/languageAdminStore.js"
import LanguagePage from "../languages/LanguagePage.vue"
import UniversityPage from "../university/UniversityPage.vue"
import SpecialtyPage from "../speciality/SpecialityPage.vue"
import {useSpecialityStore, useUniversityAdminStore} from "@/store/modules/index.js"

const store = useLanguageAdminStore()
const universityStore = useUniversityAdminStore()
const specialtyStore = useSpecialityStore()

const onChange = ()=>{
      if(store.activeTab === 3){
        store.params.search =universityStore.params.search
      }else if(store.activeTab === 2){
        specialtyStore.params.search =universityStore.params.search
      }
}
</script>

<template>
  <n-tabs
      animated
      v-model:value="store.activeTab"
      @update:value="onChange"
      class="hidden-tab-header1 mt-10"
      type="card"
  >
    <template v-for="(item,idx) in store.tabList" :key="idx">
      <n-tab-pane :name="item.id" :tab="$t(item.name)">

        <template v-if="item.id === 1">
          <UniversityPage/>
        </template>
        <template v-else-if="item.id === 2">
          <SpecialtyPage/>
        </template>
        <template v-else-if="item.id === 3">
          <LanguagePage/>
        </template>

      </n-tab-pane>
    </template>

  </n-tabs>
</template>

