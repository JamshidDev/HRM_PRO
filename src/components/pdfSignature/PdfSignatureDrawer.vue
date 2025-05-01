<script setup>
import {Signature20Filled,ArrowSyncCircle16Filled,
  PanelLeftContract20Filled, DocumentEdit24Regular,
  ClipboardCheckmark20Regular, CalendarCancel20Regular} from "@vicons/fluent"
import {UIUser, UILottieReader} from "@/components/index.js"
import generateFile from "@/assets/json/generateFile.json"
import {usePdfViewerStore, useSignatureStore, useApplicationStore} from "@/store/modules/index.js"
import ConfirmationList from "./ui/ConfirmationList.vue"
import LeftContent from "./ui/LeftContent.vue"
import ChatDrawer from "./ui/ChatDrawer.vue"
import Utils from "../../utils/Utils.js"
import {useRoute} from "vue-router"
import PdfViewer from "@/components/pdfSignature/PdfViewer.vue"
import ConformAndRejectModal from "@/components/pdfSignature/ui/ConformAndRejectModal.vue"
import DocumentFileModal from "@/components/pdfSignature/ui/DocumentFileModal.vue"
const pdfViewerRef = ref(null)

const route = useRoute()
const emits = defineEmits([
  "onClose",
  "onEdit",
  'signatureEv',
  'onUpdate',
  'onIntervalUpdate',
  'onCancelInterval'
])


const store = usePdfViewerStore()
const signatureStore = useSignatureStore()
const applicationStore = useApplicationStore()

const onSaveSignature = ()=>{
  signatureStore.confirmationId = store.signatureId
  signatureStore.documentType = store.model
  signatureStore._signatureDocument(signatureStore.signatureTypes.contract,store.document_id,onSuccess)
}

const onSuccess = (v)=>{
  signatureStore.visible = false
  emits('signatureEv')
}

const onClose = ()=>{
  store.visible = false
  emits('onClose')
}

const onEdit = ()=>{
  store.visible = false
  emits('onEdit')
}


const showSignature = computed(()=>{
  const rejects = ['/hrm/contract', '/hrm/command','/hrm/ad-contract', '/hrm/application']
  return !rejects.includes(route.path)
})

const showConfirmButtons = computed(()=>{
  return route.path === "/hrm/application"
})

const openRejectModal = ()=>{
  store.documentComment = null
  store.documentVisible = true
}

const getDocument =async (document_id, model)=>{
  store.document_id = document_id
  store.model = model
  store._resetForm()

  store.visible = true
  store.loading = true
  store.viewerLoading = false
  $ApiService.documentService._openDocument({params:{model,document_id}}).then((res)=>{
    const v = res.data.data
    const key = v.document.generate
    store.confirmations = v.confirmations
    store.document = v
    store.document.document.file_name = Utils.fileNameFromUrl(v.document?.doc_url)
    store.pdfUrl = v.document.url
    store.docxUrl = v.document?.doc_url
    store.permissions.canEdit =v.document.confirmation.id !== 3
    // store.permissions.canSignature =v.signature.signature
    store.permissions.canSignature =true
    const worker = v.signature?.current_user?.worker
    store.signatureMan = {
      photo:worker?.photo,
      lastName:worker?.last_name,
      firstName:worker?.first_name,
      middleName:worker?.middle_name,
      position:v.signature?.current_user?.position
    }
    store.permissions.qrcode = false



    if([1, 4].includes(key)){
      store.permissions.canSignature = false
      autoClose()
    }else if(key === 2){
      store.viewerLoading = true
      store.permissions.canSignature = false
      store.permissions.canEdit = false

    }else{
      store.loadPdf()
    }


  }).catch(error=>{
    console.log(error)
    autoClose()
  }).finally(()=>{
    store.loading = false
  })
}

const autoClose = ()=>{
  setTimeout(()=>{
    store.visible = false
  },200)
}

const clearInterval = ()=>{
  emits('onCancelInterval')
}


const onWheelEv = async(event)=>{
  if(!store.isCtrlPressed) return
  event.preventDefault()
  const delta =event.deltaY
  const step = 0.1
  if(delta<0){
    store.scale = Math.min(3, store.scale + step)
  }else if(delta>0){
    store.scale = Math.max(1.2, store.scale - step)
  }
}

const handleKeyDown = (event)=>{
  if (event.key === 'Control') {
    store.isCtrlPressed = true
  }
}

const handleKeyUp = (event)=>{
  if (event.key === 'Control') {
    store.isCtrlPressed = false
  }
}

const openConfirmModal = (v)=>{
  store.appButtonType = v
  store.applicationComment = null
  store.applicationVisible = !v
  if(v){
    const data = {
      status:v,
      comment:null,
    }
    const id = store.document_id
    applicationStore._accept(data,id)
  }
}


defineExpose({
  getDocument
})


onMounted(()=>{
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)


})

onUnmounted(()=>{
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

</script>

<template>
  <div>
    <n-drawer
        :close-on-esc="false"
        class="ui__onlyOffice-drawer"
        height="100vh"
        v-model:show="store.visible"
        placement="bottom">
      <n-drawer-content class="h-screen" >
        <n-spin v-model:show="store.loading">
          <div class="w-full h-screen overflow-hidden flex flex-col">

            <div class="w-full h-[60px] border-b border-surface-line flex items-center justify-between px-4 fixed top-0 left-0 z-20 bg-surface-section">
              <div class="flex gap-x-4">
                <n-button @click="onClose()" type="error" secondary>
                  {{$t('content.close')}}
                  <template #icon>
                    <n-icon size="24">
                      <PanelLeftContract20Filled/>
                    </n-icon>
                  </template>
                </n-button>
                <div class="hidden md:inline-block">
                  <div class="text-gray-600 text-sm uppercase font-medium">{{store.document?.document?.file_name}}</div>
                  <div class="text-xs text-gray-400">{{Utils.timeOnlyDate(store?.document?.document?.created)}}</div>
                </div>
              </div>
              <div>
              </div>
              <div class="flex gap-6">
                <n-button v-if="store.permissions.canEdit"  @click="onEdit" type="info" secondary>
                  {{$t('content.edit')}}
                  <template #icon>
                    <n-icon size="28">
                      <DocumentEdit24Regular/>
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </div>


            <div class="w-full flex justify-between" style="height:calc(100vh - 0px)">
              <div class="flex flex-col w-[300px] h-full bg-surface-ground border-r border-surface-line px-2 py-4 relative pt-[70px]">
                <div class="w-full" style="height: calc(100% - 100px)">
                  <LeftContent/>
                </div>
                <ChatDrawer/>
                <div v-if="store.permissions?.qrcode" class="bg-gray-300 rounded-xl border border-gray-400 h-[100px]"></div>
              </div>

              <div
                  @wheel="onWheelEv"
                  style="width: calc(100% - 0px)"
                  class=" h-full flex pt-[50px] overflow-auto"
              >
                <template v-if="!store.viewerLoading">
                  <PdfViewer ref="pdfViewerRef"/>
                </template>
                <template v-else>
                  <div class="w-full flex justify-center items-center">
                    <div>
                      <UILottieReader
                           style="height: calc(100vh - 160px)"
                          :file-url="generateFile"
                          :auto-run="true"
                      />
                      <h2 class="text-2xl text-center text-gray-400
                       font-medium
                       animate-bounce
">{{$t('content.preparingDocument')}}</h2>
                      <div class="w-full flex justify-center">
                        <n-button
                            size="medium"
                            round
                            @click="()=>emits('onUpdate')"
                        >
                          <template #icon>
                            <n-icon size="32" class="text-dark">
                              <ArrowSyncCircle16Filled/>
                            </n-icon>
                          </template>
                          {{$t('documentPage.signature.checkDocument')}}
                        </n-button>
                      </div>
                    </div>
                  </div>
                </template>


              </div>

              <div class="flex flex-col w-[300px] h-full bg-surface-ground border-l border-surface-line px-2 py-4 pt-[70px]">
                <div class="w-full" style="height: calc(100% - 110px)">
                  <h3 class="mb-1 text-gray-400 text-xs font-medium uppercase pl-2">{{$t('documentPage.signature.viewer')}}</h3>
                  <ConfirmationList/>
                </div>


                <div v-if="store.permissions?.canSignature && showSignature" class="w-full bg-surface-section rounded-xl border border-surface-line flex flex-col p-1 gap-2">
                  <div class="bg-surface-section rounded-xl p-1 mb-4 shadow">
                    <UIUser
                        :short="false"
                        :data="store.signatureMan"
                    />
                  </div>
                  <n-button
                      :disabled="!store.permissions?.canSignature"
                      @click="onSaveSignature"
                      class="shadow cursor-pointer"
                      :type="store.permissions?.canSignature ? 'primary' : 'default'"
                  >{{$t('content.signatureDocument')}}
                    <template #icon>
                      <Signature20Filled/>
                    </template>
                  </n-button>
                  <n-button
                      @click="openRejectModal"
                      class="shadow cursor-pointer"
                      :type="store.permissions?.canSignature ? 'error' : 'default'"
                  >{{$t('content.reject')}}
                    <template #icon>
                      <Signature20Filled/>
                    </template>
                  </n-button>
                </div>
<!--                Confirm buttons-->
                <div v-if="showConfirmButtons" class="w-full  rounded-lg border border-gray-300 flex flex-col gap-3 p-1">
                  <n-button
                      :loading="applicationStore.acceptLoading"
                      @click="openConfirmModal(true)"
                      class="shadow cursor-pointer"
                      type="primary"
                  >{{$t('content.confirm')}}
                    <template #icon>
                      <ClipboardCheckmark20Regular/>
                    </template>
                  </n-button>
                  <n-button
                      :loading="applicationStore.acceptLoading"
                      @click="openConfirmModal(false)"
                      class="shadow cursor-pointer"
                      type="error"
                  >{{$t('content.reject')}}
                    <template #icon>
                      <CalendarCancel20Regular/>
                    </template>
                  </n-button>
                </div>
              </div>w
            </div>

          </div>
        </n-spin>
      </n-drawer-content>
    </n-drawer>
    <ConformAndRejectModal/>
    <DocumentFileModal @onUpdate="emits('onUpdate')" />
  </div>
</template>
