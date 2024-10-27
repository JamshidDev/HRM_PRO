<script setup>
import {useRoute} from "vue-router";
import {AppLayouts} from "@/utils/index.js";
import LayoutV2 from "./LayoutV2/LayoutV2.vue";
import LayoutEmpty from "@/layouts/empty/LayoutEmpty.vue";
const route = useRoute();

const layout = computed(() => {
  switch (route?.meta?.layout) {
    case AppLayouts.empty:
      return LayoutEmpty
    default:
      return LayoutV2
  }
})

</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
