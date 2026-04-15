<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { ArrowLeft12Regular } from '@vicons/fluent'
  import Filter from './ui/Filter.vue'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'
  import ApplicationsTab from './ui/ApplicationsTab.vue'
  import ApplicationViewModal from './ui/ApplicationViewModal.vue'
  import { useVacancyStore, useAccountStore } from '@/store/modules/index.js'

  const store = useVacancyStore()
  const accStore = useAccountStore()

  const goBack = () => {
    store.activeTab = 'vacancies'
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrPublicVacancyRead)) return
    store.activeTab = 'vacancies'
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <template v-if="store.activeTab === 'vacancies'">
      <Filter />
      <Table />
    </template>
    <template v-else-if="store.activeTab === 'applications'">
      <div class="flex items-center gap-3 mb-4">
        <n-button size="small" @click="goBack">
          <template #icon>
            <n-icon :component="ArrowLeft12Regular" />
          </template>
          {{ $t('content.back') }}
        </n-button>
        <div>
          <span class="text-lg font-medium">{{ $t('vacancy.applications') }}</span>
          <span class="text-textColor3 mx-2">|</span>
          <span class="text-textColor2">{{ store.selectedVacancy?.position?.name }}</span>
          <span class="text-textColor3 text-sm ml-2">({{ store.selectedVacancy?.department?.name }})</span>
        </div>
      </div>
      <ApplicationsTab />
    </template>
    <UIModal
      :width="1200"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.visibleType ? $t('vacancy.createTitle') : $t('vacancy.updateTitle')"
    >
      <createForm />
    </UIModal>
    <ApplicationViewModal />
  </UIPageContent>
</template>
