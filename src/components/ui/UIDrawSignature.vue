<script setup>
  defineProps({
    // Chizish maydoni balandligi; ko'pchilik joyda 400px.
    height: { type: String, default: '400px' }
  })

  // `change` — har chizilgan chiziqdan, orqaga qaytarish yoki tozalashdan keyin maydon bo'shmi.
  const emit = defineEmits(['change'])

  const signaturePad = ref(null)

  const emitChange = () => emit('change', signaturePad.value?.isEmpty() ?? true)

  const options = ref({
    penColor: '#00f',
    onEnd: emitChange
  })

  const clearSignature = () => {
    signaturePad.value.clearSignature()
    emitChange()
  }

  const unDoSignature = () => {
    signaturePad.value.undoSignature()
    emitChange()
  }

  const saveSignature = () => {
    return signaturePad.value.saveSignature()
  }

  const downloadBase64File = (base64Data, filename) => {
    const link = document.createElement('a')
    link.href = base64Data
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  defineExpose({
    unDoSignature,
    saveSignature,
    downloadBase64File,
    clearSignature
  })
</script>

<template>
  <VueSignaturePad
    :options="options"
    class="border border-surface-line rounded-md bg-white"
    width="100%"
    :height="height"
    ref="signaturePad"
  />
</template>
