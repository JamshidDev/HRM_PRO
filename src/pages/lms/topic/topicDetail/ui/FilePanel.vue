<script setup>
import {TopicUtils} from "@/pages/lms/Utils/index.js";
import {Eye16Filled, PlayCircle28Filled} from "@vicons/fluent";
import {useTopicFileStore} from "@/store/modules/index.js";
import {UIMenuButton} from "@/components/index.js";
import Utils from "@/utils/Utils.js";

defineProps({
  object: Object,
})
const store = useTopicFileStore()

const showFile = (file) => {
  $MediaViewer.showMediaViewer(file.file, file.file_extension)
}

const onSelectEv = (v) => {
  if(v.key===Utils.ActionTypes.view){
    $MediaViewer.showMediaViewer(v.data.file, v.data.file_extension)
  }else if(v.key===Utils.ActionTypes.delete){
    store.elementId = v.data.id
    store._delete()
  }
}

const toggleActive = (v)=>{
  store.elementId = v.id
  store.payload.active = !v.active
  store._update()
}

</script>
<template>
  <div class="flex flex-col gap-3">
    <div v-for="(file, idx) in object.items" :key="idx"
         class="flex justify-between items-center rounded-md border border-surface-line px-3 py-1">
      <div class="flex gap-1 items-center">
        <n-switch :loading="store.saveLoading && store.elementId===file.id" :value="!!file.active" size="small" @click="toggleActive(file)"/>
        <p class="w-full truncate text-primary underline cursor-pointer select-none" @click="showFile(file)">
          {{ file.file_name }}</p>
      </div>
      <UIMenuButton
          show-view
          :data="file"
          @select-ev="onSelectEv"
          :loading="store.elementId===file.id && store.deleteLoading"
      />

    </div>
  </div>
</template>