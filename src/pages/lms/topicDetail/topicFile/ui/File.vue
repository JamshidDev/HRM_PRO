<script setup>
import {Book24Filled, Play16Filled, Image48Filled, MusicNote224Filled, VideoClip24Filled, Add16Filled, Book20Filled} from "@vicons/fluent";

defineProps({
  file: Object
});

const MediaTypeEnum = {
  VIDEO: "1",
  IMAGE: "2",
  BOOK: "3",
  AUDIO: "4"
};

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

const showFile = (file) => {
  $MediaViewer.showMediaViewer(file.file, file.file_extension)
}

</script>

<template>
  <div class="flex flex-col items-center w-full h-full p-1">
    <!-- Tooltip for filename -->
    <n-tooltip>
      {{ file.file_name }}
      <template #trigger>
        <div class="w-full truncate border-b border-surface-line shrink-0">
          <n-button
              size="small"
              :type="getMediaProperty(file.type.id).color"
               text
          >
            <p class="w-full truncate ">{{ file.file_name }}</p>
            <template #icon>
              <n-icon
                  :component="getMediaProperty(file.type.id).icon"
              ></n-icon>
            </template>
          </n-button>
        </div>

      </template>
    </n-tooltip>

    <!-- File Preview Section -->
    <div class="grow w-full flex justify-center items-center mt-2 overflow-hidden border  border-surface-line rounded-lg" @click="showFile(file)">
      <!-- Image Preview -->
      <img
          v-if="file.type.id === MediaTypeEnum.IMAGE"
          :src="file.file"
          alt="Preview"
          class="w-full h-full object-cover hover:scale-110 transition-all hover:brightness-75"
      />

      <!-- Video Preview -->
      <div
          v-else-if="file.type.id === MediaTypeEnum.VIDEO"
          class="h-full w-full relative group"
      >
        <video
            :src="file.file"
            class="w-full h-full object-cover"
        ></video>
        <div
            class="absolute w-full h-full flex justify-center items-center top-0 left-0 transition-all bg-[#000] bg-opacity-0 group-hover:bg-opacity-15"
        >
          <n-button size="large" circle type="primary" class="transition-all hover:scale-105">
            <template #icon>
              <n-icon :component="Play16Filled" />
            </template>
          </n-button>
        </div>
      </div>

      <!-- Audio Preview -->
      <div v-else-if="file.type.id === MediaTypeEnum.AUDIO" class="relative w-full h-full group">
        <n-button class="!h-full !w-full" type="primary" quaternary>
          <template #icon>
            <n-icon :component="MusicNote224Filled" :size="60" />
          </template>
        </n-button>
        <div
            class="absolute w-full h-full flex justify-center items-center top-0 left-0 transition-all bg-[#000] bg-opacity-0 group-hover:bg-opacity-15"
        >
          <n-button size="large" circle type="success" class="transition-all hover:scale-105 opacity-0 group-hover:opacity-100">
            <template #icon>
              <n-icon :component="Play16Filled" />
            </template>
          </n-button>
        </div>
      </div>
<!--      <audio-->
<!--          -->
<!--          :src="file.file"-->
<!--          controls-->
<!--          class="w-full"-->
<!--      ></audio>-->

      <!-- Book (PDF) Preview -->
      <n-button v-else-if="file.type.id === MediaTypeEnum.BOOK" class="!h-full !w-full" type="success" quaternary >
        <template #icon>
          <n-icon :component="Book20Filled" :size="60" />
        </template>
      </n-button>
<!--      <iframe-->
<!--          v-else-if="file.type.id === MediaTypeEnum.BOOK"-->
<!--          :src="file.file"-->
<!--          class="w-full h-full max-h-full"-->
<!--          loading="lazy"-->

<!--          scrolling="no"-->
<!--      ></iframe>-->

      <!-- Default Icon if No Preview -->
      <n-icon
          v-else
          :component="getMediaProperty(file.type.id).icon"
          class="text-gray-500 text-4xl"
      />
    </div>
  </div>
</template>
