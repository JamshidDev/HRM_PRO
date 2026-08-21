<script setup>
  import { NoDataPicture, UIModal, UIPagination } from '@/components/index.js'
  import WarningCameraRecording from '@/pages/attestation/Camera/ui/WarningCameraRecording.vue'
  import { useExamAttemptStore, useWorkerExamStore, useExamVideoStore } from '@/store/modules/index.js'
  import TopicCard from './TopicCard.vue'

  const store = useWorkerExamStore()
  const examStore = useExamAttemptStore()
  const examVideoStore = useExamVideoStore()
  const selectedRowId = ref(null)
  const warningVisible = ref(false)

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    selectedRowId.value = null
    store._index()
  }

  const onChangeCollapse = (idx) => {
    selectedRowId.value = selectedRowId.value === idx ? null : idx
  }

  const onContinueEv = async () => {
    warningVisible.value = false
    await examVideoStore.checkUserMediaDevice(() => {
      examStore._start_attempt()
    })
  }

  // Desktopda kartalar 2 ta MUSTAQIL ustunga bo'linadi (grid emas): CSS Grid'da bitta
  // qatordagi karta kengaysa, undan keyingi barcha qatorlar (ikkala ustunda ham) pastga
  // suriladi. Mustaqil ustunlarda esa karta kengayishi faqat o'z ustunidagi pastdagi
  // kartalarga ta'sir qiladi, qo'shni ustunga umuman tegmaydi.
  const columns = computed(() => {
    const cols = [[], []]
    store.list.forEach((item, idx) => cols[idx % 2].push({ item, idx }))
    return cols
  })
</script>

<template>
  <div class="h-full">
    <n-spin
      :show="store.loading"
      class="topicCardList__spin h-full rounded-md min-h-[clamp(200px,calc(100vh-100%),600px)]"
    >
      <div
        v-if="store.list.length > 0"
        class="h-full bg-surface-section rounded-3xl p-1 flex flex-col gap-6 sm:gap-8"
      >
        <!-- mobil: bitta tartiblangan ustun -->
        <div class="sm:hidden flex flex-col gap-3 flex-1 content-start overflow-y-auto">
          <TopicCard
            v-for="(item, idx) in store.list"
            :key="idx"
            :item="item"
            :idx="idx"
            :opened="idx === selectedRowId"
            @toggle="onChangeCollapse"
            @show-warning="warningVisible = true"
          />
        </div>

        <!-- desktop: 2 ta mustaqil ustun -->
        <div class="hidden sm:flex items-start gap-3 flex-1 content-start overflow-y-auto">
          <div v-for="(col, ci) in columns" :key="ci" class="flex-1 min-w-0 flex flex-col gap-3">
            <TopicCard
              v-for="{ item, idx } in col"
              :key="idx"
              :item="item"
              :idx="idx"
              :opened="idx === selectedRowId"
              @toggle="onChangeCollapse"
              @show-warning="warningVisible = true"
            />
          </div>
        </div>

        <div
          v-if="store.totalItems > 0 && !store.loading"
          class="bg-[var(--exam-pagination-bg)] rounded-b-3xl px-4 sm:px-6"
        >
          <UIPagination
            :page="store.params.page"
            :per_page="store.params.per_page"
            :total="store.totalItems"
            @change-page="changePage"
          />
        </div>
      </div>
      <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
    </n-spin>
    <UIModal
      v-model:visible="warningVisible"
      :width="400"
      :title="$t('cameraPage.warningRecording')"
    >
      <WarningCameraRecording @onContinueEv="onContinueEv" />
    </UIModal>
  </div>
</template>

<style scoped>
  /* Table.vue'dagi bilan bir xil muammo: n-spin o'z kontentini balandligi bo'lmagan
     div ichiga o'raydi, shu sababli ichkaridagi h-full hech qachon hal bo'lmaydi va
     pagination qatorlardan keyin osilib qolardi (konteyner tubiga emas). */
  .topicCardList__spin :deep(.n-spin-content) {
    height: 100%;
  }
</style>
