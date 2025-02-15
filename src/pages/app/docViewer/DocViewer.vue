<script setup>
import * as docx from "docx-preview";
const docxContainer =ref()

const getDoc = async ()=>{
  const fileUrl = "http://192.168.82.90:9000/docflow/contracts/093011797fe6ba2c2c3071d393638de3.docx"
  const response = await fetch(fileUrl)
  const arrayBuffer = await response.arrayBuffer()
  docx.renderAsync(arrayBuffer,docxContainer.value,docxContainer.value, {
    breakPages:true,
    ignoreLastRenderedPageBreak:false,
  }).then((res)=>{
    console.log(res)
  })

}

onMounted(()=>{
  getDoc()
})
</script>

<template>

  <div ref="docxContainer" class="docx-container"></div>
</template>

<style scoped>
.docx-container {
  width: 100%;
  overflow: auto;
}
</style>