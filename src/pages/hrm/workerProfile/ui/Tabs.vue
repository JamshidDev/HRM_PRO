<script setup>
import PersonalForm from "../tabs/PersonalForm.vue"
import RelativesPage from "@/pages/hrm/relative/RelativesPage.vue"
import LanguagePage from "@/pages/hrm/language/LanguagePage.vue"
import UniversityPage from "@/pages/hrm/university/UniversityPage.vue"
import {useWorkerProfileStore} from "@/store/modules/index.js"

const store = useWorkerProfileStore()
</script>

<template>
  <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
    <n-tab-pane v-for="(item, idx) in store.tabs" :name="item.id" :key="idx">
      <template v-if="store.tabs[0].id === item.id">
        <PersonalForm/>
      </template>
      <template v-if="store.tabs[1].id === item.id">
        <LanguagePage/>
        <UniversityPage/>
      </template>
      <template v-if="store.tabs[3].id === item.id">
        <RelativesPage/>
      </template>
    </n-tab-pane>
  </n-tabs>
</template>