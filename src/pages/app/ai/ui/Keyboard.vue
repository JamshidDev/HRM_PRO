<script setup>
import {useAIConversationStore} from "@/store/modules/index.js"

const store = useAIConversationStore()
</script>

<template>
<div class="w-full rounded-3xl bg-[#F8FAFC] py-2 px-2 border border-gray-300 shadow-keyboard">
  <n-input
      @keyup.enter="store.sendMessage"
      :bordered="false"
      class="!bg-[#F8FAFC] !border-none"
      v-model:value="store.payload.question"
      placeholder="Savolizni yo'llang!"
      type="textarea"
      :rows="1"
      :autosize="{
        minRows:1,
        maxRows:1
      }"
      size="small"
      :loading="store.loading"
  />
</div>
</template>

<style scoped>
.shadow-keyboard{
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
}
</style>