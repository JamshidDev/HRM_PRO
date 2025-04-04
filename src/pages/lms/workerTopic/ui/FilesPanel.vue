<script setup>
import File from "../../topic/topicDetail/ui/File.vue"
import {TopicUtils} from "@/pages/lms/Utils/index.js";
import {Eye16Filled, PlayCircle28Filled} from "@vicons/fluent";
const props = defineProps({
  files: Array,
  type: Number
})

const showFile = (file) => {
  $MediaViewer.showMediaViewer(file.file, file.file_extension)
}

</script>
<template>
  <div class="flex flex-col gap-3">
    <div v-for="(file, idx) in files" :key="idx" class="flex justify-between items-center rounded-md border border-surface-line px-3 py-1">
        <p class="w-full truncate text-primary underline cursor-pointer select-none" @click="showFile(file)">{{ file.file_name }}</p>
      <n-tooltip>
        {{$t(type===TopicUtils.AUDIO ? 'content.listen' : 'content.view')}}
        <template #trigger>
          <n-button tertiary type="primary" circle @click="showFile(file)">
            <template #icon>
              <n-icon :component="type===TopicUtils.AUDIO ? PlayCircle28Filled : Eye16Filled" />
            </template>
          </n-button>
        </template>
      </n-tooltip>
    </div>
  </div>

</template>