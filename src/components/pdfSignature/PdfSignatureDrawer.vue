<script setup>
import {Signature20Filled,ArrowSyncCircle16Filled,
  PanelLeftContract20Filled, DocumentEdit24Regular,
  ClipboardCheckmark20Regular, CalendarCancel20Regular,
  Settings20Regular, DocumentArrowDown16Regular, DocumentPdf32Regular} from "@vicons/fluent"
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
import wordAppIcon from "@/assets/images/svg/word-app.svg"
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
    console.log(v)
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
          <div class="w-full h-screen overflow-hidden flex flex-col relative">

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
              <div class="flex gap-3">
                <n-button v-if="!showSignature && store?.pdfUrl && !store.viewerLoading" tag="a" target="_blank" :href="store.pdfUrl" download type="warning" secondary>
                  {{$t('content.download')}}
                  <template #icon>
                    <n-icon size="28">
                      <DocumentPdf32Regular />
                    </n-icon>
                  </template>
                </n-button>
                <n-button v-if="!showSignature && store?.docxUrl && !store.viewerLoading" tag="a" target="_blank" :href="store?.docxUrl" download type="success" secondary>
                  {{$t('content.download')}}
                  <template #icon>
                    <n-icon size="22">
                      <svg  fill="#18a058" version="1.1" font-weight="700" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            width="100%" height="100%" viewBox="0 0 31.519 31.519"
                            xml:space="preserve">
<g>
	<g>
		<path d="M11.184,0L3.021,8.619v22.9h25.477V0H11.184z M10.463,3.624v3.819H6.847L10.463,3.624z M26.528,29.55H4.991V9.413h7.443
			V1.97h14.094V29.55z"/>
    <path d="M13.5,15.211c0.127,0.046,0.238,0.111,0.335,0.197c0.102,0.095,0.196,0.213,0.278,0.351
			c0.095,0.16,0.188,0.345,0.268,0.532l0.62,1.764l-1.68,4.828l-2.107-6.003c-0.135-0.372-0.235-0.679-0.296-0.92
			c-0.079-0.3-0.085-0.408-0.085-0.435c0-0.102,0.036-0.178,0.127-0.256c0.096-0.085,0.271-0.129,0.506-0.129h0.59v-1.079H6.701
			v1.079h0.37c0.3,0,0.538,0.043,0.688,0.125c0.144,0.079,0.257,0.198,0.346,0.367c0.039,0.072,0.158,0.363,0.502,1.32l3.794,10.6
			h0.852l2.564-7.236l2.579,7.236h0.891l3.564-10.303c0.322-0.982,0.479-1.342,0.549-1.469c0.076-0.136,0.155-0.248,0.232-0.336
			c0.065-0.074,0.137-0.135,0.209-0.179c0.074-0.044,0.154-0.075,0.244-0.095c0.102-0.021,0.225-0.032,0.361-0.032h0.37v-1.079
			h-4.461v1.079h0.368c0.352,0,0.634,0.048,0.84,0.142c0.124,0.058,0.169,0.127,0.169,0.271c0,0.135-0.051,0.503-0.383,1.462
			l-2.028,5.868l-2.035-5.779c-0.327-0.913-0.394-1.327-0.394-1.515c0-0.2,0.064-0.284,0.115-0.33
			c0.046-0.045,0.174-0.117,0.508-0.117h0.7v-1.079h-5.595v1.079h0.369C13.194,15.142,13.368,15.164,13.5,15.211z"/>
	</g>
</g>
</svg>
                    </n-icon>

                  </template>
                </n-button>
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

              <div class="hidden md:flex  flex-col w-[300px] h-full bg-surface-ground border-r border-surface-line px-2 py-4 relative pt-[70px]">
                <div class="w-full" style="height: calc(100% - 100px)">
                  <LeftContent/>
                </div>
                <ChatDrawer/>
                <div v-if="store.permissions?.qrcode" class="bg-gray-300 rounded-xl border border-gray-400 h-[100px]"></div>
              </div>

              <div
                  @wheel="onWheelEv"
                  style="width: calc(100% - 600px)"
                  class=" h-full flex pt-[50px] overflow-auto pdf-viewer-box"
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

              <div class="hidden md:flex flex-col w-[300px] h-full bg-surface-ground border-l border-surface-line px-2 py-4 pt-[70px]">
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
              </div>
            </div>
            <div class="vertical-text absolute z-999 top-[80px] right-0 text-white px-1 py-2 bg-surface-400 rounded-tl-lg rounded-bl-lg border border-surface-line">
              <n-icon>
                <Settings20Regular/>
              </n-icon>
              Vertical text</div>

          </div>
        </n-spin>
      </n-drawer-content>
    </n-drawer>
    <ConformAndRejectModal/>
    <DocumentFileModal @onUpdate="emits('onUpdate')" />
  </div>
</template>

<style scoped>
.vertical-text{
  writing-mode: vertical-rl;
}
.pdf-viewer-box{
  width:calc(100% - 600px) !important;
}
@media only screen and (max-width: 769px) {
    .pdf-viewer-box{
      width: 100% !important;
    }
}
</style>
