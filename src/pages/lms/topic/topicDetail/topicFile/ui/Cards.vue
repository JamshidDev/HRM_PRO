<script setup>
import {useTopicFileStore} from "@/store/modules/index.js";
import {Add16Filled, Book24Filled, Image48Filled, MusicNote224Filled, VideoClip24Filled} from "@vicons/fluent";
const store = useTopicFileStore()

const MediaTypeEnum = {
  VIDEO: 1,
  IMAGE: 2,
  BOOK: 3,
  AUDIO: 4
}


const getMediaProperty = (typeId) => {
  switch (typeId) {
    case MediaTypeEnum.BOOK:
      return {color: "info", icon: Book24Filled};
    case MediaTypeEnum.IMAGE:
      return {color: "success", icon: Image48Filled};
    case MediaTypeEnum.VIDEO:
      return {color: "error", icon: VideoClip24Filled};
    case MediaTypeEnum.AUDIO:
      return {color: "primary", icon: MusicNote224Filled};
    default:
      return {color: "default", icon: Add16Filled}; // Default icon for unknown types
  }
};

</script>
<template>
  <n-spin class="h-full mt-2" :show="store.loading">
    <div class="grid grid-cols-[repeat(auto-fill,minmax(0,150px))] gap-2">
      <template v-for="(item, idx) in  store.list">
        <div class="w-full p-5 bg-blue-50 rounded-md transition-all hover:bg-blue-100 cursor-pointer flex flex-col gap-2" >
          <div class="flex items-center gap-1">
            <n-icon-wrapper class="shrink-0" :size="30" :border-radius="10" >
              <n-icon :size="18" :component="getMediaProperty(item.id).icon" />
            </n-icon-wrapper>
            <p class="text-primary font-medium text-xl">{{item.name}}</p>

          </div>
          <p class="text-xs text-gray-500 font-semibold">
            {{$t('examPage.nFiles', {n: item.items.length})}}
          </p>
        </div>
      </template>
    </div>
  </n-spin>
</template>