<script setup>
  import { watch } from 'vue'
  import { useWorkerProfileStore } from '@/store/modules/index.js'
  import PartyPage from '@/pages/hrm/party/PartyPage.vue'
  import MilitaryPage from '@/pages/hrm/military/MilitaryPage.vue'
  import DisabilityList from '../ui/DisabilityList.vue'
  import WorkerPositionCertificatePage from '@/pages/hrm/workerPositionCertificate/WorkerPositionCertificatePage.vue'

  /** Figma "Qo'shimcha" bobi (node 2672:255721) */
  const store = useWorkerProfileStore()

  // Nogironlik ro'yxati xodim uuid'i kelgach yuklanadi
  onMounted(() => {
    if (store.data?.uuid) store._indexWorkerDisability()
  })

  watch(
    () => store.data?.uuid,
    (val) => {
      if (val) store._indexWorkerDisability()
    }
  )
</script>

<template>
  <div class="flex flex-col gap-5 w-full">
    <PartyPage />
    <MilitaryPage />
    <DisabilityList />
    <!-- Maketda yo'q, lekin mavjud bo'lim — funksiya yo'qolmasligi uchun saqlab qolindi -->
    <WorkerPositionCertificatePage />
  </div>
</template>
