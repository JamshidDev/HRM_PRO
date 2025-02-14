<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
import {History20Regular, ChevronUp48Filled, DocumentArrowDown16Regular, DocumentTextLink24Regular, FolderLink48Filled} from "@vicons/fluent"
import Utils from "../../../utils/Utils.js"
const store = usePdfViewerStore()

const getHistory = ()=>{
  store.fileShow = false
  if(!store.show && store.document?.histories>0){
    store._history()
  }else{
    store.show = false
  }
}

const getFiles = ()=>{
  store.show = false
  if(!store.fileShow && store.document?.files>0){
    store._files()
  }else{
    store.fileShow = false
  }
}

const onDownload = (v)=>{
  window.open(v.file, "_blank")
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <n-badge type="info" :value="store.show? 0 :store.document?.histories" class="w-full">
      <n-button  style="width:100%" @click="getHistory" :loading="store.historyLoading">
        <template #icon>
          <ChevronUp48Filled v-if="store.show" />
          <History20Regular v-else/>
        </template>
        {{store.show? $t('content.hide') : $t('documentPage.signature.history')}}
      </n-button>
    </n-badge>
    <n-collapse-transition :show="store.show" class="bg-surface-section p-2 rounded">
      <template v-for="(item, idx) in store.historyList" :key="idx">
        <div class="flex justify-between w-full py-1">
          <div class="flex gap-2">
            <n-avatar size="small" round :src="item.user.photo"/>
            <div class="flex items-center">
              <span class="text-xs text-gray-600 font-medium">{{`${item.user.last_name}.${item.user.first_name[0]}`}}</span>
            </div>
          </div>
          <div class="flex flex-col justify-end">
            <span @click="onDownload(item)" class="text-sm text-end underline flex items-center gap-2 justify-end cursor-pointer hover:text-primary">{{item.status.name}} <n-icon size="16"><DocumentArrowDown16Regular/></n-icon></span>
            <span class="text-xs text-gray-500">{{Utils.timeWithMonth(item.created_at)}}</span>
          </div>
        </div>
      </template>
    </n-collapse-transition>

    <n-badge type="success" :value="store.fileShow? 0 :store.document?.files" class="w-full">
      <n-button  style="width:100%" @click="getFiles" :loading="store.fileLoading">
        <template #icon>
          <ChevronUp48Filled v-if="store.fileShow" />
          <DocumentTextLink24Regular v-else/>
        </template>
        {{store.fileShow? $t('content.hide') : $t('documentPage.signature.files')}}
      </n-button>
    </n-badge>
    <n-collapse-transition :show="store.fileShow" class="bg-surface-section p-2 rounded">
      <template v-for="(item, idx) in store.fileList" :key="idx">
        <div class="flex justify-between py-1 px-2 border-b border-surface-line cursor-pointer">
          <n-icon size="18" class="text-surface-500"><FolderLink48Filled/></n-icon>
          <span @click="onDownload(item)" class="w-[200px] truncate hover:text-primary">{{Utils.fileNameFromUrl(item.file)}}</span>
        </div>
      </template>
    </n-collapse-transition>
  </div>

</template>

<style scoped>

</style>