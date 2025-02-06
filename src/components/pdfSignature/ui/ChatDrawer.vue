<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
const store = usePdfViewerStore()
import {Chat24Filled} from "@vicons/fluent"
import ChatContent from "../chat/ChatCotent.vue"

const openChat = ()=>{
  store.chatVisible = !store.chatVisible
}
</script>

<template>
  <div>
    <n-popover
        placement="right"
        trigger="click"
        @update:show="openChat"

    >
      <template #trigger>
        <div class="absolute bottom-[100px] right-[20px]">
          <n-badge :value="3" :max="15">
            <n-button circle text size="large">
              <template #icon>
                <n-icon size="32" class="text-surface-900">
                  <Chat24Filled/>
                </n-icon>
              </template>
            </n-button>
          </n-badge>

        </div>

      </template>
      <div class="w-[360px] h-[500px] bg-white">
        <ChatContent/>
      </div>
    </n-popover>


<!--    <UIDrawer-->
<!--        :visible="store.chatVisible"-->
<!--        @update:visible="(v)=>store.chatVisible = v"-->
<!--        :mask-closable="false"-->
<!--        title="Muxokama uchun chat"-->
<!--    >-->
<!--      <template #content>-->
<!--        <ChatContent/>-->
<!--      </template>-->
<!--    </UIDrawer>-->
  </div>

</template>

<style scoped>

</style>