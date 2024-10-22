<script setup>
import OtpForm from "./ui/OtpForm.vue";
import createForm from "./ui/createForm.vue"
import {useRegisterStore} from "@/store/modules/registrStore.js";
const store = useRegisterStore()


</script>

<template>
  <div class="w-full min-h-screen flex justify-center items-center bg-gradient--v2">
    <div class="flex overflow-hidden border border-surface-line rounded-xl shadow-sm bg-surface-section">
      <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
        <n-tab-pane :name="store.tabList[0]">
          <OtpForm/>
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[1]">
         <createForm/>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>