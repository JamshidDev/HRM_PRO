<script setup>
import PersonalForm from "../tabs/PersonalForm.vue"
import RelativesPage from "@/pages/hrm/relative/RelativesPage.vue"
import LanguagePage from "@/pages/hrm/language/LanguagePage.vue"
import UniversityPage from "@/pages/hrm/university/UniversityPage.vue"
import PartyPage from "@/pages/hrm/party/PartyPage.vue"
import OldCareerPage from "@/pages/hrm/oldCareer/OldCareerPage.vue"
import MilitaryPage from "@/pages/hrm/military/MilitaryPage.vue"
import AcademicTitlePage from "@/pages/hrm/academicTitle/AcademicTitlePage.vue"
import AcademicDegreePage from "@/pages/hrm/academicDegree/AcademicDegreePage.vue"
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
      <template v-if="store.tabs[2].id === item.id">
        <OldCareerPage/>
      </template>
      <template v-if="store.tabs[3].id === item.id">
        <RelativesPage/>
      </template>
      <template v-if="store.tabs[4].id === item.id">
        <PartyPage/>
        <MilitaryPage/>
        <AcademicTitlePage/>
        <AcademicDegreePage/>
      </template>
    </n-tab-pane>
  </n-tabs>
</template>