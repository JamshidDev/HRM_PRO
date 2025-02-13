<script setup>
import * as docx from "docx-preview";
const docxContainer =ref(null)

const openWord = async(url)=>{
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  docx.renderAsync(arrayBuffer,docxContainer.value,docxContainer.value, {
    breakPages:true,
    ignoreLastRenderedPageBreak:false,
  }).then((res)=>{
    console.log(res)
  })
}

defineExpose({
  openWord
})
</script>

<template>
  <div ref="docxContainer" class="docx-container"></div>
</template>

<style lang="scss">
.docx-container {
  width: 100%;
  overflow: auto;
  .docx-wrapper{
    padding: 10px !important;

    .docx{
      box-shadow: none;
      @apply border border-surface-line
    }

    @apply bg-surface-section
  }
}
</style>