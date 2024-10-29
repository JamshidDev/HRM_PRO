<script setup>
import {useRoute} from "vue-router";
import {AppLayouts} from "@/utils/index.js";
import LayoutV2 from "./LayoutV2/LayoutV2.vue";
import LayoutEmpty from "@/layouts/empty/LayoutEmpty.vue";
import {useAccountStore} from "@/store/modules/accountStore.js";
const route = useRoute()
const store = useAccountStore()

const layout = computed(() => {
  switch (route?.meta?.layout) {
    case AppLayouts.empty:
      return LayoutEmpty
    default:
      return LayoutV2
  }
})

const initialApp = ()=>{
  store._index()
}
onMounted(()=>{
  initialApp()
})

</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
