<script setup>
import {Signature20Filled,
  PanelLeftContract20Filled, DocumentEdit24Regular,
  CloudArrowDown16Filled, History20Regular} from "@vicons/fluent"
import PdfViewer from "./PdfViewer.vue"
import {UIUser} from "@/components/index.js"
import {usePdfViewerStore, useSignatureStore} from "@/store/modules/index.js"
import ConfirmationList from "./ui/ConfirmationList.vue"

const pdfViewerRef = ref(null)


const emits = defineEmits(["onClose", "onEdit"])

const store = usePdfViewerStore()
const signatureStore = useSignatureStore()

const onSaveSignature = ()=>{
  // store.addQRCodeToPDF()
  signatureStore._signatureDocument(signatureStore.signatureTypes.contract,11,onSuccess)
}

const onSuccess = (v)=>{
  console.log(v)
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


const getDocument =async (document_id, model)=>{
  store.visible = true
  store.loading = true
  $ApiService.documentService._openDocument({params:{model,document_id}}).then((res)=>{
    const v = res.data.data
    store.confirmations = v.confirmations
    store.document = v
    store.pdfUrl = v.document.url
    store.permissions = v.signature
    store.loadPdf()
     // pdfViewerRef.value.loadPdf(v.document.url)
  }).finally(()=>{
    store.loading = false
  })
}

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
            <div class="w-full h-[60px] border-b border-gray-300 flex items-center justify-between px-4">
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
                  <div class="text-xs text-gray-400">15.01.2025</div>
                </div>
              </div>
              <div>
              </div>
              <div class="flex gap-6">
                <n-input-number
                    class="w-[100px]"
                    v-model:value="store.scale"
                    min="1"
                    max="1.6"
                    step="0.1"
                    @update:value="onZoom"
                />
                <n-button type="success" secondary circle>
                  <template #icon>
                    <n-icon size="24">
                      <CloudArrowDown16Filled/>
                    </n-icon>
                  </template>
                </n-button>
                <n-button @click="onEdit" type="info" secondary>
                  {{$t('content.edit')}}
                  <template #icon>
                    <n-icon size="24">
                      <DocumentEdit24Regular/>
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </div>

            <div class="w-full flex justify-between" style="height: calc(100vh - 60px)">
              <div class="flex flex-col w-[300px] h-full bg-surface-ground border-r border-surface-line px-2 py-4">
                <div class="w-full" style="height: calc(100% - 100px)">
                  <n-badge type="info" :value="store.document?.histories" class="w-full">
                    <n-button  style="width:100%">
                      <template #icon>
                        <History20Regular/>
                      </template>
                      {{$t('documentPage.signature.history')}}
                    </n-button>
                  </n-badge>

                </div>

                <div v-if="store.permissions?.qrcode" class="bg-gray-300 rounded-xl border border-gray-400 h-[100px]"></div>
              </div>
              <div class="w-[860px] h-full flex">
                <PdfViewer ref="pdfViewerRef"/>
              </div>
              <div class="flex flex-col w-[300px] h-full bg-surface-ground border-l border-surface-line px-2 py-4">
                <div class="w-full" style="height: calc(100% - 110px)">
                  <h3 class="mb-1 text-gray-400 text-xs font-medium uppercase pl-2">{{$t('documentPage.signature.viewer')}}</h3>
                  <ConfirmationList/>
                </div>


                <div v-if="store.permissions?.signature" class="w-full bg-gray-300 rounded-xl border border-gray-400 flex flex-col p-1">
                  <div class="bg-white rounded-xl p-1 mb-4 shadow">
                    <UIUser
                        :short="false"
                        :data="{
                          photo:'dfsdf.pmg',
                           lastName:'Raximov',
                           firstName:'Jamshid',
                           middleName:'Shuxrat ogli',
                           position:'Bosh bugalter'
                      }"
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
