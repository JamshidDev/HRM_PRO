<!-- YandexMap.vue -->
<template>
  <div ref="mapContainer" style="width: 100%; height: 400px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ymaps from 'yandex-maps'; // Import the Yandex Maps library

const mapContainer = ref<HTMLElement | null>(null); // Reference to the map container div

onMounted(() => {
  // Ensure the map is loaded before initializing
  ymaps
      .load()
      .then((ymapsInstance) => {
        const map = new ymapsInstance.Map(mapContainer.value!, {
          center: [55.751244, 37.618423], // Default coordinates: Moscow
          zoom: 10,
          controls: ['zoomControl', 'geolocationControl'],
        });

        // Add a placemark
        const placemark = new ymapsInstance.Placemark([55.751244, 37.618423], {
          balloonContent: 'Moscow',
        });
        map.geoObjects.add(placemark);
      })
      .catch((error) => console.error('Failed to load Yandex Maps:', error));
});
</script>

<style scoped>
/* Optional styling for the map container */
</style>
