<script setup>
import {TopicUtils} from "@/pages/attestation/Utils/index.js";
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
  <div class="flex flex-col gap-3 p-3">
    <div v-for="(file, idx) in files" :key="idx"
         class="flex justify-between items-center rounded-xl border border-surface-line px-3 py-2"
         style="box-shadow: rgba(100, 100, 111, 0.1) 0px 7px 29px 0px;">
      <p class="w-full truncate cursor-pointer select-none" @click="showFile(file)">
        {{ file.file_name }}</p>
      <n-tooltip>
        {{ $t(type === TopicUtils.AUDIO ? 'content.listen' : 'content.view') }}
        <template #trigger>
          <n-button ghost size="small" type="primary" @click="showFile(file)">
            <template #icon>
              <n-icon :component="type===TopicUtils.AUDIO ? PlayCircle28Filled : Eye16Filled"/>
            </template>
          </n-button>
        </template>
      </n-tooltip>
    </div>
  </div>

</template>