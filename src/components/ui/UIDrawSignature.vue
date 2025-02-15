<script setup>
const signaturePad = ref(null)

const options = ref({
  penColor: '#00f',
})

const clearSignature = ()=>{
  signaturePad.value.clearSignature()
}

const unDoSignature = ()=>{
  signaturePad.value.undoSignature()
}

const saveSignature = ()=>{
  return signaturePad.value.saveSignature();
}

const downloadBase64File = (base64Data, filename) => {
  const link = document.createElement("a");
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

defineExpose({
  unDoSignature,
  saveSignature,
  downloadBase64File,
  clearSignature,
})
</script>

<template>
  <VueSignaturePad
      :options="options"
      class="border border-surface-line rounded-md bg-white"
      width="100%"
      height="400px"
      ref="signaturePad"
  />
</template>