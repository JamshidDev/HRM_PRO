<script setup>
import VueEasyLightbox from "vue-easy-lightbox"

const visible = ref(false)
const imageUrl = ref(null)

const openEv = (v)=>{
  imageUrl.value = v
  visible.value = true
}

onMounted(()=>{
  window.$openViewer = openEv
})
</script>

<template>
  <vue-easy-lightbox
      class="image-viewer-container"
      :visible="visible"
      :imgs="[imageUrl]"
      @hide="visible = false"
  />
</template>
