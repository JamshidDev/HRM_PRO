<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
const store = usePdfViewerStore()
import {Chat24Filled} from "@vicons/fluent"
import {UIDrawer} from "@/components/index.js"
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
        <div class="absolute bottom-[30px] right-[20px]">
          <n-button circle class="!bg-white shadow-3d " size="large">
            <template #icon>
              <n-icon size="28" class="text-primary">
                <Chat24Filled/>
              </n-icon>
            </template>
          </n-button>
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