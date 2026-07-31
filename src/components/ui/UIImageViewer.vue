<script setup>
  import VueEasyLightbox from 'vue-easy-lightbox'

  const visible = ref(false)
  const imgs = ref([])
  const index = ref(0)

  const openEv = (v, startIndex = 0) => {
    imgs.value = Array.isArray(v) ? v : [v]
    index.value = startIndex
    visible.value = true
  }

  onMounted(() => {
    window.$openViewer = openEv
  })
</script>

<template>
  <vue-easy-lightbox
    class="image-viewer-container"
    :visible="visible"
    :imgs="imgs"
    :index="index"
    @hide="visible = false"
  />
</template>
