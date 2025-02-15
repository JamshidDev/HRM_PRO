<script setup>
import * as docx from "docx-preview";
const docxContainer =ref(null)

const prop = defineProps({
  watermark:{
    type:Boolean,
    default:false,
  }
})

const openWord = async(url)=>{
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  docx.renderAsync(arrayBuffer,docxContainer.value,docxContainer.value, {
    breakPages:true,
    ignoreLastRenderedPageBreak:false,
  }).then((res)=>{
  })
}

defineExpose({
  openWord
})
</script>

<template>
  <div
      :class="[watermark && 'watermark']"
      ref="docxContainer"
      class="docx-container"></div>
</template>

<style lang="scss">
.docx-container {
  width: 100%;
  min-width: 600px;
  overflow: auto;
  .docx-wrapper{
    padding: 10px !important;

    .docx{
      box-shadow: none;
      @apply border border-surface-line
    }

    @apply bg-[transparent]
  }
}

.watermark{
  .docx{
    position: relative;
    &:before{
      width: 800px;
      content: 'Hujjat imzolangan';
      position: absolute;
      font-size: 90px;
      text-align: center;
      font-weight: bold;
      color: var(--green-100);
      top: 50%;
      left: 50%;
      transform: translate( -50%, -50% ) rotate(45deg);
    }
  }
}
</style>