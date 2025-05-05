<script setup>
import TopicCardList from "./ui/TopicCardList.vue"
import TopicDetail from './ui/TopicDetail.vue'
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js";
import ExamResultChart from './ui/ExamResultChart.vue'
import {UIModal, UIPageFilter} from "@/components/index.js";
import ViewAttemptModal from "./solveExam/ViewAttemptModal.vue";
import stars from "@/assets/images/svg/stars.svg";

const store = useWorkerExamStore()
const examStore = useExamAttemptStore()

onMounted(()=>{
  examStore._config_localstorage()
  store.params.page = 1
  store.params.search = null
  store._index()
  store.selectedLesson = null
})

</script>

<template>
  <div class="mx-2 mt-4 mb-4 rounded-sm flex flex-col gap-3" style="min-height:calc(100vh - 100px);height:calc(100vh - 100px);">
    <n-grid cols="12" class="shrink-0 min-h-[250px]" x-gap="10" item-responsive responsive="screen">
      <n-grid-item class="welcome rounded-lg" span="0 s:8">
        <img alt="stars" class="stars first" :src="stars" />
        <img alt="stars" class="stars middle" :src="stars" />
        <img alt="stars" class="stars last" :src="stars" />
        <div class="text">
          <h1 class="text-white mb-4">{{ $t('solveExamPage.welcomeTitle') }}</h1>
          <p class="text-white">{{ $t('solveExamPage.welcomeDesc') }}</p>
        </div>
      </n-grid-item>
      <n-grid-item class="min-h-[250px]" span="12 s:4">
          <ExamResultChart />
      </n-grid-item>
    </n-grid>
    <div class="grow basis-auto overflow-hidden flex gap-3" :style="{gap: store?.selectedLesson ? '12px' : 0}">
      <div class="grow basis-auto flex flex-col gap-2">
        <UIPageFilter :show-add-button="false" class="shrink-0" />
        <div class="grow basis-auto bg-surface-section rounded-md">
          <TopicCardList/>
        </div>
      </div>
      <div :style="{'width': store?.selectedLesson ? '50%' : '0'}"
           class="transition-all  bg-surface-section rounded-md">
          <TopicDetail />
      </div>
    </div>
    <UIModal v-model:visible="examStore.visible" :width="1000" :title="$t('examPage.attemptErrors')">
      <ViewAttemptModal />
    </UIModal>
  </div>
</template>

<style lang="scss" scoped>
@media (max-width: 850px) {
  .welcome{
    background-image: none;
  }
}
.welcome {
  background-color: #156eea;
  background-repeat: no-repeat;
  @media (min-width: 800px) {
    background-image: url("@/assets/images/svg/attestation.svg");
  }

  background-position: center right;
  background-size: auto 100%;
  position: relative;
  padding: 0;
  overflow: hidden;
}

.stars {
  mix-blend-mode: color-dodge;
  user-select: none;
  pointer-events: none;
  position: absolute;
  height: 100%;

  &.first {
    left: 0;
  }

  &.middle {
    right: 25%;
    bottom: -30%;
  }

  &.last {
    right: 0;
  }
}

.text {
  max-width: 600px;
  padding: 40px 30px;

  h1 {
    font-size: 2rem;
    font-weight: 600;
  }

  p {
    font-size: 1rem;
    font-weight: 500;
  }
}
</style>
