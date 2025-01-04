<script setup>
import {useRoute} from "vue-router";
import {AppLayouts} from "@/utils/index.js";
import Combo from "./combo/Combo.vue";
import Empty from "./empty/Empty.vue";
import {useAccountStore} from "@/store/modules/app/accountStore.js";


const route = useRoute()
const store = useAccountStore()

const layout = computed(() => {
  switch (route?.meta?.layout) {
    case AppLayouts.empty:
      return Empty
    default:
      return Combo
  }
})


</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
