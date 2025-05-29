<script setup lang="ts">
import VueEasyLightbox from 'vue-easy-lightbox'
import {onMounted} from "vue"
defineProps({
  src: {
    type: String,
    required: true
  }
})

defineEmits(['close'])

</script>
<template>
  <vue-easy-lightbox
      :imgs="src"
      :index="0"
      :visible="true"
      @hide="$emit('close')"
  />
</template>
