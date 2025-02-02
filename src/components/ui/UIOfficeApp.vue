<script setup>
import {UIPdfSignatureDrawer, UIOnlyOfficeDrawer} from "@/components/index.js"
import {useOnlyOfficeStore, useAccountStore, usePdfViewerStore} from "@/store/modules/index.js"
const onlyOfficeStore = useOnlyOfficeStore()
const accountStore = useAccountStore()
const pdfViewerStore = usePdfViewerStore()

const pdfSignatureRef = ref(null)
const payload = ref(null)

const emits = defineEmits(['signatureEv'])

const openPdf = (document_id, model, signatureId)=>{
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


defineExpose({
  openPdf,
  openWord,
})



</script>

<template>
  <div>
    <UIPdfSignatureDrawer ref="pdfSignatureRef" @onEdit="onEditPdf" @signatureEv="onSignatureEv"/>
    <UIOnlyOfficeDrawer @onBack="onBackWord"/>
  </div>
</template>
