<script setup>
import List from "./ui/List.vue"
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js";
import {Warning20Filled} from "@vicons/fluent";
import {UIModal, UIPageContent} from "@/components/index.js";
import stars from "@/assets/images/svg/stars.svg";

const store = useWorkerExamStore()
const examStore = useExamAttemptStore()

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  examStore._config_localstorage()
  store.params.page = 1
  store.params.search = null
  store._index()
})

</script>

<template>
  <div class="mx-2 mt-4 mb-4 rounded">
    <n-grid cols="12" class="py-2">
      <n-grid-item class="min-h-[180px] welcome rounded-lg" :span="12">
        <img alt="stars" class="stars first" :src="stars" />
        <img alt="stars" class="stars middle" :src="stars" />
        <img alt="stars" class="stars last" :src="stars" />
        <div class="text">
          <h1 class="text-white mb-4">{{ $t('solveExamPage.welcomeTitle') }}</h1>
          <p class="text-white">{{ $t('solveExamPage.welcomeDesc') }}</p>
        </div>
      </n-grid-item>
    </n-grid>
    <List/>
  </div>
</template>

<style lang="scss" scoped>
.welcome {
  background-color: #5897EF;
  background-repeat: no-repeat;
  background-image: url("@/assets/images/svg/attestation.svg");

  @media (max-width: 850px) {
    background-image: none;
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
