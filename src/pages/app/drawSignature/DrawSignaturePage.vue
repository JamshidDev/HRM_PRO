<script setup>
const signaturePad = ref(null)

const options = ref({
  penColor: '#00f',
})

const unDoSignature = ()=>{
  signaturePad.value.undoSignature()
}

const saveSignature = ()=>{
  const { isEmpty, data } = signaturePad.value.saveSignature();
  downloadBase64File(data, 'signature.png')

}

const downloadBase64File = (base64Data, filename) => {
  const link = document.createElement("a");
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(()=>{
  console.log(signaturePad.value)
})
</script>

<template>
  <div class="w-full h-screen flex justify-center items-center">
    <div class="w-full max-w-[500px] flex flex-col">
      <VueSignaturePad
          :options="options"
          class="border border-surface-line rounded-md"
          width="100%"
          height="400px"
          ref="signaturePad"
      />
      <div class="w-full flex justify-between mt-6">
        <n-button @click="unDoSignature" >Undo</n-button>
        <n-button @click="saveSignature()" >Save</n-button>
      </div>
    </div>

  </div>
</template>

<style scoped>

</style>