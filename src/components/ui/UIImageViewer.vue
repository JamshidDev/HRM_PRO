<script setup>
  import VueEasyLightbox from 'vue-easy-lightbox'

  const visible = ref(false)
  const imgs = ref([])
  const index = ref(0)
  // `rounded`: rasm burchaklari aylantiriladi — burchagi rasmning o'zida chizilgan
  // (tashqarisi oq) bannerlar uchun, aks holda oq to'rtburchak burchaklar ko'rinadi.
  const rounded = ref(false)

  const openEv = (v, startIndex = 0, options = {}) => {
    imgs.value = Array.isArray(v) ? v : [v]
    index.value = startIndex
    rounded.value = !!options.rounded
    visible.value = true
  }

  onMounted(() => {
    window.$openViewer = openEv
  })
</script>

<template>
  <vue-easy-lightbox
    class="image-viewer-container"
    :class="{ 'image-viewer-container--rounded': rounded }"
    :visible="visible"
    :imgs="imgs"
    :index="index"
    @hide="visible = false"
  />
</template>

<style>
  /* Radius rasm o'lchamiga nisbatan (eni / bo'yi bo'yicha foiz) — rasm qancha
     kattalashsa ham burchak rasmdagi chizilgan burchakni to'liq yopadi */
  .image-viewer-container--rounded .vel-img {
    border-radius: 3% / 9%;
  }
</style>
