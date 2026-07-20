<script setup>
  import { watch } from 'vue'
  import PersonalForm from '../tabs/PersonalForm.vue'
  import DisabilityList from './DisabilityList.vue'
  import RelativesPage from '@/pages/hrm/relative/RelativesPage.vue'
  import LanguagePage from '@/pages/hrm/language/LanguagePage.vue'
  import LanguageCertificatePage from '@/pages/hrm/languageCertificate/LanguageCertificatePage.vue'
  import UniversityPage from '@/pages/hrm/university/UniversityPage.vue'
  import PartyPage from '@/pages/hrm/party/PartyPage.vue'
  import OldCareerPage from '@/pages/hrm/oldCareer/OldCareerPage.vue'
  import MilitaryPage from '@/pages/hrm/military/MilitaryPage.vue'
  import AcademicTitlePage from '@/pages/hrm/academicTitle/AcademicTitlePage.vue'
  import AcademicDegreePage from '@/pages/hrm/academicDegree/AcademicDegreePage.vue'
  import { useWorkerProfileStore } from '@/store/modules/index.js'

  const store = useWorkerProfileStore()

  onMounted(() => {
    if (store.data?.uuid) {
      store._indexWorkerDisability()
    }
  })

  watch(() => store.data?.uuid, (val) => {
    if (val) {
      store._indexWorkerDisability()
    }
  })
</script>

<template>
  <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
    <n-tab-pane :name="1">
      <PersonalForm />
      <DisabilityList />
    </n-tab-pane>
    <n-tab-pane :name="2">
      <LanguagePage />
      <LanguageCertificatePage />
      <UniversityPage />
    </n-tab-pane>
    <n-tab-pane :name="3">
      <OldCareerPage />
    </n-tab-pane>
    <n-tab-pane :name="4">
      <RelativesPage />
    </n-tab-pane>
    <n-tab-pane :name="5">
      <PartyPage />
      <MilitaryPage />
      <AcademicTitlePage />
      <AcademicDegreePage />
    </n-tab-pane>
  </n-tabs>
</template>
