<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
import {History20Regular, ChevronUp48Filled, DocumentArrowDown16Regular,
  TextBulletListLtr16Regular, AttachText20Regular, MailAttach16Regular} from "@vicons/fluent"
import Utils from "../../../utils/Utils.js"
import {UIUser} from "@/components/index.js"
import DocumentFileModal from "@/components/pdfSignature/ui/DocumentFileModal.vue"

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

const onOpenAttach = ()=> {
  store.workerApplications = []
  store.attachFiles = []
  store.attachVisible = true
}

const onDownload = (url)=>{
  window.open(url, "_blank")
}

onMounted(()=>{
  store.fileShow = false
  store.show = false
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <n-badge :value="store.show? 0 :store.document?.histories" class="w-full">
      <n-button type="tertiary" secondary  style="width:100%" @click="getHistory" :loading="store.historyLoading">
        <template #icon>
          <n-icon size="20">
            <ChevronUp48Filled v-if="store.show" />
            <History20Regular v-else/>
          </n-icon>
        </template>
        {{store.show? $t('content.hide') : $t('documentPage.signature.history')}}
      </n-button>
    </n-badge>
    <n-input-group>
      <n-badge type="success" :value="store.fileShow? 0 :store.document?.files" class="w-full">
        <n-button type="primary" secondary  style="width:100%" @click="getFiles" :loading="store.fileLoading">
          <template #icon>
            <n-icon size="20">
              <ChevronUp48Filled v-if="store.fileShow" />
              <TextBulletListLtr16Regular v-else/>
            </n-icon>

          </template>
          {{store.fileShow? $t('content.hide') : $t('documentPage.signature.files')}}
        </n-button>
      </n-badge>
      <n-button
          @click="onOpenAttach"
          type="primary"
      >
        <template #icon>
          <n-icon size="26">
            <AttachText20Regular/>
          </n-icon>

        </template>
      </n-button>
    </n-input-group>
    <n-collapse-transition :show="store.fileShow" class="bg-surface-section p-2 rounded overflow-hidden">
      <template v-for="(item, idx) in store.fileList" :key="idx">

        <template v-if="item?.file">
          <div class="flex justify-between py-1 px-2 border-b border-surface-line cursor-pointer">
            <n-icon size="20" class="text-surface-500"><AttachText20Regular/></n-icon>
            <span @click="onDownload(item.file)" class="w-[220px] truncate hover:text-primary">{{item.original_name}}</span>
          </div>
        </template>
        <template v-else>
          <div class="flex justify-between py-1 px-2 border-b border-surface-line cursor-pointer">
            <n-icon size="20" class="text-surface-500"><MailAttach16Regular/></n-icon>
            <span @click="onDownload(item?.worker_application?.confirmation_file)" class="w-[220px] truncate hover:text-primary">{{item?.worker_application?.number}}</span>
          </div>
        </template>

      </template>
    </n-collapse-transition>
    <n-collapse-transition :show="store.show" class="bg-surface-section p-2 rounded overflow-hidden">
      <template v-for="(item, idx) in store.historyList" :key="idx">
        <div class="flex flex-col justify-between w-full py-1 border-b  border-dashed border-surface-line">
          <div class="flex">
            <UIUser
                :short="false"
                :data="{
                           photo:item.user?.worker.photo,
                           lastName:item.user.worker.last_name,
                           firstName:item.user.worker.first_name,
                           middleName:item.user.worker.middle_name,
                           position:null,
                      }"
            >
              <template #position>
                <span @click="onDownload(item)" class="text-[10px] text-end text-primary underline flex items-center cursor-pointer hover:text-primary">
                  <n-icon class="mr-1" size="16"><DocumentArrowDown16Regular/></n-icon>
                  {{item.status.name}}
                </span>
              </template>
            </UIUser>
<!--            <n-avatar size="small" round :src="item.user.photo"/>-->
<!--            <div class="flex items-center">-->
<!--              <span class=" text-gray-600 font-medium">{{`${item.user.last_name}.${item.user.first_name[0]}`}}</span>-->
<!--            </div>-->
          </div>
          <div class="flex flex-col justify-end">
            <span class="text-xs text-gray-400 text-end">{{Utils.timeWithMonth(item.created_at)}}</span>
          </div>
        </div>
      </template>
    </n-collapse-transition>
  </div>

</template>

<style scoped>

</style>