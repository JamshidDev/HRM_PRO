<script setup>
import onlyOfficeApp from "./onlyOfficeApp.vue"
import {useOnlyOfficeStore} from "@/store/modules/index.js"
const store = useOnlyOfficeStore()
</script>

<template>
  <n-drawer class="ui__onlyOffice-drawer" height="100vh" v-model:show="store.visible" width="100%"  placement="bottom">
    <n-drawer-content title="Stoner" class="h-screen" >
      <onlyOfficeApp/>
    </n-drawer-content>
  </n-drawer>
</template>
