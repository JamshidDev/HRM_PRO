<script setup>
import {UIPdfSignatureDrawer, UIOnlyOfficeDrawer} from "@/components/index.js"
import {useOnlyOfficeStore, useAccountStore} from "@/store/modules/index.js"
const onlyOfficeStore = useOnlyOfficeStore()
const accountStore = useAccountStore()

const pdfSignatureRef = ref(null)
const payload = ref(null)

const openPdf = (document_id, model)=>{
  payload.value = {document_id,model}
  pdfSignatureRef.value.getDocument(document_id, model)
}

const openWord = (document_id, model)=>{
  payload.value = {document_id,model}
  $ApiService.documentService._openDocument({params:{model,document_id}}).then((res)=>{
    const v = res.data.data
    onlyOfficeStore.config.document.url = v.doc_url
    onlyOfficeStore.model = model
    onlyOfficeStore.document_id = document_id
    onlyOfficeStore.user_uuid = accountStore.account?.uuid
    onlyOfficeStore._setOnlyOfficeVisible(true)
  }).finally(()=>{
  })

}

const onEditPdf = (v)=>{
  setTimeout(()=>{
    openWord(payload.value.document_id,payload.value.model)
  },200)
}

const onBackWord = ()=>{
  setTimeout(()=>{
    openPdf(payload.value.document_id,payload.value.model)
  },200)

}





defineExpose({
  openPdf,
  openWord,
})



</script>

<template>
  <div>
    <UIPdfSignatureDrawer ref="pdfSignatureRef" @onEdit="onEditPdf"/>
    <UIOnlyOfficeDrawer @onBack="onBackWord"/>
  </div>
</template>
