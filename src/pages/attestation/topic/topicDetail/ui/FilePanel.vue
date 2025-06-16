<script setup>
import {useTopicFileStore} from "@/store/modules/index.js";
import {UIMenuButton} from "@/components/index.js";
import Utils from "@/utils/Utils.js";
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

defineProps({
  object: Object,
})
const store = useTopicFileStore()

const showFile = (file) => {
  $MediaViewer.showMediaViewer(file.file, file.file_extension)
}

const onSelectEv = (v) => {
  if(!accStore.checkAction(accStore.pn.examTopicsRead)) return
  if(v.key===Utils.ActionTypes.view){
    $MediaViewer.showMediaViewer(v.data.file, v.data.file_extension)
  }else if(v.key===Utils.ActionTypes.delete){
    if(!accStore.checkAction(accStore.pn.examTopicsWrite)) return
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
  <div class="flex flex-col gap-3 px-1">
    <n-grid cols="1 600:2" x-gap="20" y-gap="15">
      <template  v-for="(file, idx) in object.items" :key="idx">
        <n-gi span="1">
          <div
              class="flex justify-between items-center rounded-xl border border-surface-line px-3 py-1"  style="box-shadow: rgba(50, 50, 93, 0.25) 0 0 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;">
            <div class="flex gap-1 items-center truncate">
              <n-switch :loading="store.saveLoading && store.elementId===file.id" :value="!!file.active" size="small" @click="toggleActive(file)"/>
              <p class="w-full truncate text-primary underline cursor-pointer select-none" @click="showFile(file)">{{ file.file_name }}</p>
            </div>
            <UIMenuButton
                show-view
                :data="file"
                @select-ev="onSelectEv"
                :loading="store.elementId===file.id && store.deleteLoading"
            />

          </div>
        </n-gi>
      </template>
    </n-grid>

  </div>
</template>