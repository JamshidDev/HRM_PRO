<script setup>
import {UIPdfSignatureDrawer, UIOnlyOfficeDrawer} from "@/components/index.js"
import {useOnlyOfficeStore, useAccountStore, usePdfViewerStore} from "@/store/modules/index.js"
import {v4 as uuidv4} from "uuid"
import RejectModal from "@/components/pdfSignature/ui/RejectModal.vue"
const onlyOfficeStore = useOnlyOfficeStore()
const accountStore = useAccountStore()
const pdfViewerStore = usePdfViewerStore()

const pdfSignatureRef = ref(null)
const payload = ref(null)

const emits = defineEmits(['signatureEv'])

const openPdf = (document_id, model, signatureId)=>{
  pdfViewerStore.model = model
  pdfViewerStore.signatureId = signatureId
  payload.value = {document_id,model}
  pdfSignatureRef.value.getDocument(document_id, model)
}

const openWord = (document_id, model)=>{
  payload.value = {document_id,model}
  $ApiService.documentService._openDocument({params:{model,document_id}}).then((res)=>{
    const v = res.data.data
    onlyOfficeStore.config.document.url = v.document.doc_url
    onlyOfficeStore.model = model
    onlyOfficeStore.document_id = document_id
    onlyOfficeStore.user_uuid = accountStore.account?.uuid
    onlyOfficeStore._setOnlyOfficeVisible(true)
  }).finally(()=>{
  })
}

const openEv = (document_id, model)=>{
  onlyOfficeStore.model = model
  onlyOfficeStore.document_id = document_id
  onlyOfficeStore.config.document.url = pdfViewerStore.docxUrl
  onlyOfficeStore.config.document.title = pdfViewerStore.document.document.file_name
  onlyOfficeStore.config.editorConfig.user = {
    name:`${accountStore.account?.last_name} ${accountStore.account?.first_name}`,
    id:accountStore.account.id,
  }
  onlyOfficeStore.config.document.key = uuidv4()
  onlyOfficeStore.user_uuid = accountStore.account?.uuid

  onlyOfficeStore._setOnlyOfficeVisible(true)
}

const onEditPdf = (v)=>{
  setTimeout(()=>{
    openEv(payload.value.document_id,payload.value.model)
  },200)
}

const onBackWord = ()=>{
  setTimeout(()=>{
    openPdf(payload.value.document_id,payload.value.model, pdfViewerStore.signatureId)
  },200)

}


const onSignatureEv = ()=>{
  openPdf(pdfViewerStore.document_id, pdfViewerStore.model,pdfViewerStore.signatureId)
  emits('signatureEv')
}

const onRejectEv = ()=>{
  openPdf(pdfViewerStore.document_id, pdfViewerStore.model,pdfViewerStore.signatureId)
  emits('signatureEv')
}


defineExpose({
  openPdf,
  openWord,
})



</script>

<template>
  <div>
    <UIPdfSignatureDrawer ref="pdfSignatureRef" @onEdit="onEditPdf" @signatureEv="onSignatureEv"/>
    <UIOnlyOfficeDrawer @onBack="onBackWord"/>
    <RejectModal @onSuccessEv="onRejectEv" />
  </div>
</template>
