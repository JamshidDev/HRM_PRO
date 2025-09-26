<script setup>
import {useExamAttemptStore} from "@/store/modules/index.js"
import {NoDataPicture} from "@/components/index.js"

const store = useExamAttemptStore()

</script>

<template>
  <n-spin :show="store.videoLoading" class="h-[calc(100vh-160px)]">

    <div class="!h-full overflow-hidden">
      <div class="grid grid-cols-12 gap-4">
        <template v-for="item in store.videosList" :key="item.id">
          <div class="col-span-4 border border-surface-line overflow-hidden rounded-lg">
            <video
                class="w-full rounded-lg"
                :src="item"
                preload="metadata"
                controls
                controlslist="nodownload noplaybackrate noremoteplayback"
                disablepictureinpicture
            ></video>
          </div>
        </template>
      </div>
      <NoDataPicture v-if="store.videosList.length===0 && !store.videoLoading"/>
    </div>

  </n-spin>
</template>
