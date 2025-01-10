<script setup>
import {Signature20Filled, HandRight16Filled, Handshake20Filled,
  PanelLeftContract20Filled, DocumentEdit24Regular,
  CloudArrowDown16Filled} from "@vicons/fluent"
import PdfViewer from "./PdfViewer.vue"
import {UIUser} from "@/components/index.js"
import {usePdfViewerStore} from "@/store/modules/index.js"
import ConfirmationList from "./ui/ConfirmationList.vue"

const pdfViewerRef = ref(null)


const emits = defineEmits(["onClose", "onEdit"])

const store = usePdfViewerStore()

const onSaveSignature = ()=>{
  store.addQRCodeToPDF()
}

const onClose = ()=>{
  store.visible = false
  emits('onClose')
}

const onEdit = ()=>{
  store.visible = false
  emits('onEdit')
}

const getDocument =async (document_id, model)=>{
  store.visible = true
  store.loading = true
  $ApiService.documentService._openDocument({params:{model,document_id}}).then((res)=>{
    const v = res.data.data
    store.confirmations = v.confirmations
     pdfViewerRef.value.loadPdf(v.url)
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
              <div>
                <n-button @click="onClose()" type="error" secondary>
                  {{$t('content.close')}}
                  <template #icon>
                    <n-icon size="24">
                      <PanelLeftContract20Filled/>
                    </n-icon>

                  </template>

                </n-button>
              </div>
              <div></div>
              <div class="flex gap-6">
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
              <div class="flex flex-col-reverse w-[300px] h-full bg-surface-ground border-r border-surface-line px-2 py-4">
                <div class="bg-gray-300 rounded-xl border border-gray-400 h-[100px]"></div>
              </div>
              <div class="w-[860px] h-full flex">
                <PdfViewer ref="pdfViewerRef"/>
              </div>
              <div class="flex flex-col w-[300px] h-full bg-surface-ground border-l border-surface-line px-2 py-4">
                <div class="w-full" style="height: calc(100% - 110px)">
                  <h3 class="mb-1 text-gray-400 text-xs font-medium uppercase pl-2">Hujjat bilan tanishgan xodimlar</h3>
                  <ConfirmationList/>
                </div>


                <div class="w-full bg-gray-300 rounded-xl border border-gray-400 flex flex-col p-1">
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
                  <n-button @click="onSaveSignature" class="shadow cursor-pointer" type="primary">{{$t('content.signatureDocument')}}
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
