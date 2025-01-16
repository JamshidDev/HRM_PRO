<script setup>
import {useLanguageAdminStore} from "@/store/modules/admin/languageAdminStore.js"
import LanguagePage from "../languages/LanguagePage.vue"
import UniversityPage from "../university/UniversityPage.vue"
import SpecialtyPage from "../speciality/SpecialityPage.vue"

const store = useLanguageAdminStore()

const onChange = ()=>{
      if(store.activeTab === 3){
        if(store.list.length === 0){
          store._index()
        }
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

