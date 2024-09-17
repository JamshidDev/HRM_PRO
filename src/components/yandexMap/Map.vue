
<script setup>
import { yandexMap, ymapMarker } from "vue-yandex-maps"
import { ref, watch } from 'vue'
const coords = ref([40.3842, 71.7843])
const marker_cords = ref([40.3842,71.7843])
const lat = ref(40.3842)
const long = ref(71.7843)
const markerIcon = {
  imageHref: "https://cdn-icons-png.flaticon.com/512/2555/2555572.png",
  imageSize: [43, 43],
  imageOffset: [0, 0],
}
const controls =  ['zoomControl','geolocationControl','fullscreenControl','searchControl']
// watch(lat, (val) => {
//   map.lat = val
// })
// watch(long, (val) => {
//   map.long = val
// })
const onClick = (e) => {
  marker_cords.value = e.get('coords')
  lat.value = e.get('coords')[0]
  long.value = e.get('coords')[1]
}
</script>

<template>
  <yandex-map
      :coords="coords"
      zoom="9"
      style="height: 200px"
      :controls="controls"
      @click="onClick"
  >
    <ymap-marker marker-id="123" :coords="marker_cords" :icon="markerIcon"/>
  </yandex-map>
</template>