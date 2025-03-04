<script setup>
import {Signature20Filled,
  PanelLeftContract20Filled, DocumentEdit24Regular, Chat24Filled} from "@vicons/fluent"
import {UIUser} from "@/components/index.js"
import {usePdfViewerStore, useSignatureStore, useOnlyOfficeStore, useAccountStore} from "@/store/modules/index.js"
import ConfirmationList from "./ui/ConfirmationList.vue"
import LeftContent from "./ui/LeftContent.vue"
import ChatDrawer from "./ui/ChatDrawer.vue"
import Utils from "../../utils/Utils.js"
import {useRoute} from "vue-router"
import DocxViewer from "./ui/DocxViewer.vue"
import IFrameViewer from "./ui/IFrameViewer.vue"
import PdfViewer from "@/components/pdfSignature/PdfViewer.vue"

const docxViewerRef = ref(null)
const pdfViewerRef = ref(null)

const route = useRoute()


const emits = defineEmits(["onClose", "onEdit", 'signatureEv'])

const store = usePdfViewerStore()
const signatureStore = useSignatureStore()

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
  const rejects = ['/hrm/contract', '/hrm/command','/hrm/ad-contract']
  return !rejects.includes(route.path)
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

const documentUrl = computed(()=>{
  const fileUrl = store.document?.document?.doc_url
  const baseUrl = `https://view.officeapps.live.com/op/embed.aspx?src=`
  return fileUrl? baseUrl+fileUrl : null
})

defineExpose({
  getDocument
})


</script>

<template>
  <div>
    <n-drawer :close-on-esc="false" class="ui__onlyOffice-drawer" height="100vh" v-model:show="store.visible"  placement="bottom">
      <n-drawer-content title="Stoner" class="h-screen" >
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
              <div style="width: calc(100% - 600px)" class=" h-full flex pt-[50px]">
                <PdfViewer ref="pdfViewerRef"/>
<!--                <DocxViewer ref="docxViewerRef" />-->
<!--                <IFrameViewer v-if="documentUrl" :url="documentUrl" />-->
<!--                <onlyOfficeApp class="pt-1" v-if="showOffice"/>-->
              </div>
              <div class="flex flex-col w-[300px] h-full bg-surface-ground border-l border-surface-line px-2 py-4 pt-[70px]">
                <div class="w-full" style="height: calc(100% - 110px)">
                  <h3 class="mb-1 text-gray-400 text-xs font-medium uppercase pl-2">{{$t('documentPage.signature.viewer')}}</h3>
                  <ConfirmationList/>
                </div>


                <div v-if="store.permissions?.signature && showSignature" class="w-full bg-gray-300 rounded-xl border border-gray-400 flex flex-col p-1">
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
                </div>
              </div>
            </div>
          </div>
        </n-spin>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
