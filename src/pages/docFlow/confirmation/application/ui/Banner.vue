<script setup>
import {useConfApplicationStore,} from "@/store/modules/index.js"

import stars from "@/assets/images/svg/stars.svg";

const store = useConfApplicationStore()
const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

</script>

<template>
  <n-grid cols="12" >
    <n-grid-item class="min-h-[180px] welcome rounded-lg" :span="8">
      <img alt="stars" class="stars first" :src="stars" />
      <img alt="stars" class="stars middle" :src="stars" />
      <img alt="stars" class="stars last" :src="stars" />
      <div class="text">
        <h1 class="text-white mb-4">{{ $t('solveExamPage.welcomeTitle') }}</h1>
        <n-button @click="onAdd" size="large" class="!bg-white !font-bold">{{$t('applicationPage.addApp')}}</n-button>
      </div>
    </n-grid-item>
    <n-gi :span="4" />
  </n-grid>
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
  background-image: url("@/assets/images/svg/attestation.svg");
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
