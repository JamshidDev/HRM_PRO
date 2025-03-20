<script setup>
import {Signature20Filled,
  PanelLeftContract20Filled, DocumentEdit24Regular, ClipboardCheckmark20Regular, CalendarCancel20Regular} from "@vicons/fluent"
import {UIUser} from "@/components/index.js"
import {usePdfViewerStore, useSignatureStore, useOnlyOfficeStore, useApplicationStore} from "@/store/modules/index.js"
import ConfirmationList from "./ui/ConfirmationList.vue"
import LeftContent from "./ui/LeftContent.vue"
import ChatDrawer from "./ui/ChatDrawer.vue"
import Utils from "../../utils/Utils.js"
import {useRoute} from "vue-router"
import PdfViewer from "@/components/pdfSignature/PdfViewer.vue"
import ConformAndRejectModal from "@/components/pdfSignature/ui/ConformAndRejectModal.vue"
const pdfViewerRef = ref(null)

const route = useRoute()


const emits = defineEmits(["onClose", "onEdit", 'signatureEv'])

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

const onZoom = async ()=>{
  await store.loadPdf()
}

const showSignature = computed(()=>{
  const rejects = ['/hrm/contract', '/hrm/command','/hrm/ad-contract', '/hrm/application']
  return !rejects.includes(route.path)
})

const showConfirmButtons = computed(()=>{
  return route.path === "/hrm/application"
})

const signatureMan = computed(()=>{
   const {worker} = store.permissions?.current_user
    if(worker){
      return {
        photo:worker.photo,
        lastName:worker.last_name,
        firstName:worker.first_name,
        middleName:worker.middle_name,
        position:store.permissions?.current_user?.position
      }
    }else return  null
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
  $ApiService.documentService._openDocument({params:{model,document_id}}).then((res)=>{
    const v = res.data.data
    store.confirmations = v.confirmations
    store.document = v
    store.document.document.file_name = Utils.fileNameFromUrl(v.document?.doc_url)
    store.pdfUrl = v.document.url
    store.docxUrl = v.document?.doc_url
    store.permissions = v.signature
    store.permissions.qrcode = false
    // docxViewerRef.value.openWord(v.document?.doc_url)
    store.loadPdf()

  }).finally(()=>{
    store.loading = false
  })
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
    <n-drawer :close-on-esc="false" class="ui__onlyOffice-drawer" height="100vh" v-model:show="store.visible"  placement="bottom">
      <n-drawer-content class="h-screen" >
        <n-spin v-model:show="store.loading">
          <div class="w-full h-screen overflow-hidden flex flex-col">

            <div class="w-full h-[60px] border-b border-gray-300 flex items-center justify-between px-4 fixed top-0 left-0 z-20 bg-white">
              <div class="flex gap-x-4">
                <n-button @click="onClose()" type="error" secondary>
                  {{$t('content.close')}}
                  <template #icon>
                    <n-icon size="24">
                      <PanelLeftContract20Filled/>
                    </n-icon>

                  </template>

                </n-button>
                <div>
                  <div class="text-gray-600 text-sm uppercase font-medium">{{store.document?.document?.file_name}}</div>
                  <div class="text-xs text-gray-400">{{Utils.timeOnlyDate(store?.document?.document?.created)}}</div>
                </div>
              </div>
              <div>
              </div>
              <div class="flex gap-6">
                <n-button v-if="store.permissions?.current_user"  @click="onEdit" type="info" secondary>
                  {{$t('content.edit')}}
                  <template #icon>
                    <n-icon size="24">
                      <DocumentEdit24Regular/>
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </div>


            <div class="w-full flex justify-between" style="height: calc(100vh - 0px)">
              <div class="flex flex-col w-[300px] h-full bg-surface-ground border-r border-surface-line px-2 py-4 relative pt-[70px]">
                <div class="w-full" style="height: calc(100% - 100px)">
                  <LeftContent/>
                </div>
                <ChatDrawer/>
                <div v-if="store.permissions?.qrcode" class="bg-gray-300 rounded-xl border border-gray-400 h-[100px]"></div>
              </div>
              <div
                  @wheel="onWheelEv"
                  style="width: calc(100% - 600px)"
                  class=" h-full flex pt-[50px] overflow-auto"
              >
                <PdfViewer ref="pdfViewerRef"/>
              </div>




              <div class="flex flex-col w-[300px] h-full bg-surface-ground border-l border-surface-line px-2 py-4 pt-[70px]">
                <div class="w-full" style="height: calc(100% - 110px)">
                  <h3 class="mb-1 text-gray-400 text-xs font-medium uppercase pl-2">{{$t('documentPage.signature.viewer')}}</h3>
                  <ConfirmationList/>
                </div>


                <div v-if="store.permissions?.signature && showSignature" class="w-full bg-gray-300 rounded-xl border border-gray-400 flex flex-col p-1 gap-2">
                  <div class="bg-white rounded-xl p-1 mb-4 shadow">
                    <UIUser
                        :short="false"
                        :data="signatureMan"
                    />
                  </div>
                  <n-button
                      :disabled="!store.permissions?.signature"
                      @click="onSaveSignature"
                      class="shadow cursor-pointer"
                      :type="Boolean(store.permissions?.signature)? 'primary' : 'default'"
                  >{{$t('content.signatureDocument')}}
                    <template #icon>
                      <Signature20Filled/>
                    </template>
                  </n-button>
                  <n-button
                      @click="openRejectModal"
                      class="shadow cursor-pointer"
                      :type="Boolean(store.permissions?.signature)? 'error' : 'default'"
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
  </div>
</template>
