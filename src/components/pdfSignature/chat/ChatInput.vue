<script setup>
import {Send24Filled, AttachText24Regular} from "@vicons/fluent"
import {usePdfViewerStore} from "@/store/modules/index.js"
const store = usePdfViewerStore()

const onMessageEv = ()=>{
  store._addMessage(store.msg)
}
</script>

<template>
  <div class="w-full flex items-start border border-surface-line rounded-lg bg-white">
    <div class="chat__input" style="width:calc(100% - 36px)">
      <n-input
          class="w-full border-none!"
          type="textarea"
          size="small"
          :autosize="{
             minRows: 1,
             maxRows: 4,
             }"
          :placeholder="$t(`content.message`)"
          v-model:value="store.msg"
      />
    </div>
    <div class="w-[36px]  flex justify-center items-center h-full rotate-[-45deg]">
      <n-button text @click="onMessageEv" :loading="store.chatLoading">
        <template #icon>
          <n-icon  size="24" class="text-primary cursor-pointer rotate-[-45deg]">
            <Send24Filled/>
          </n-icon>
        </template>
      </n-button>

    </div>
  </div>
</template>
