<script setup>
  import { useWorkerProfileStore, useComponentStore } from '@/store/modules/index.js'
  import { UIFigField } from '@/components/index.js'
  import LanguagePage from '@/pages/hrm/language/LanguagePage.vue'
  import LanguageCertificatePage from '@/pages/hrm/languageCertificate/LanguageCertificatePage.vue'
  import UniversityPage from '@/pages/hrm/university/UniversityPage.vue'
  import AcademicDegreePage from '@/pages/hrm/academicDegree/AcademicDegreePage.vue'
  import AcademicTitlePage from '@/pages/hrm/academicTitle/AcademicTitlePage.vue'

  /** Figma "Ma'lumot va malaka" bobi (node 2667:253728) */
  const store = useWorkerProfileStore()
  const componentStore = useComponentStore()

  // Maketda "Ma'lumoti" alohida karta emas — to'g'ridan-to'g'ri tahrirlanadigan tanlov.
  // Xodim yuklanib bo'lmaguncha saqlash yuborilmaydi: `buildBodyData` to'liq
  // payload'ga tayanadi, yarim to'ldirilgani bilan chaqirilsa xatoga olib keladi.
  const onEducationChange = () => {
    if (store.workerId) store.savePersonalInfo()
  }
</script>

<template>
  <div class="flex flex-col gap-5 w-full">
    <div class="education-head">
      <UIFigField :label="$t('createWorkerPage.form.education')" editing>
        <n-select
          v-model:value="store.payload.education"
          filterable
          :options="componentStore.educationList"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
          @update:value="onEducationChange"
        />
      </UIFigField>
    </div>

    <LanguagePage />
    <LanguageCertificatePage />
    <UniversityPage />
    <AcademicDegreePage />
    <AcademicTitlePage />
  </div>
</template>

<style lang="scss" scoped>
  // Maketda maydon uch ustunli to'rning bittasi kengligida turadi
  .education-head {
    width: calc((100% - 24px) / 3);
    min-width: 240px;
  }
</style>
