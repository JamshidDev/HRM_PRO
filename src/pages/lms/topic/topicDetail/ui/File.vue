<script setup>
import { Play16Filled, MusicNote224Filled,Book20Filled} from "@vicons/fluent";
import {TopicUtils} from "@/pages/lms/Utils/index.js";

const props = defineProps({
  file: Object,
  type: Number
});

const showFile = (file) => {
  $MediaViewer.showMediaViewer(file.file, file.file_extension)
}
const conf = computed(()=>TopicUtils.getMediaProperty(props.type))

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
              :type="conf.type"
               text
          >
            <p class="w-full truncate ">{{ file.file_name }}</p>
            <template #icon>
              <n-icon
                  :component="conf.icon"
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
          v-if="type === TopicUtils.IMAGE"
          :src="file.file"
          alt="Preview"
          class="w-full h-full object-cover hover:scale-110 transition-all hover:brightness-75"
      />

      <!-- Video Preview -->
      <div
          v-else-if="type === TopicUtils.VIDEO"
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
      <div v-else-if="type === TopicUtils.AUDIO" class="relative w-full h-full group">
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

      <n-button v-else-if="type === TopicUtils.BOOK" class="!h-full !w-full" type="success" quaternary >
        <template #icon>
          <n-icon :component="Book20Filled" :size="60" />
        </template>
      </n-button>

    </div>
  </div>
</template>
