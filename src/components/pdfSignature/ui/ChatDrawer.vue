<script setup>
import {usePdfViewerStore} from "@/store/modules/index.js"
const store = usePdfViewerStore()
import {Chat24Filled} from "@vicons/fluent"
import ChatContent from "../chat/ChatCotent.vue"

const openChat = ()=>{
  store.chatVisible = !store.chatVisible
}

const chatCount = computed(()=>{
  return  store.document?.chats || 0
})

</script>

<template>
  <div>
    <n-popover
        placement="right"
        trigger="click"
        @update:show="openChat"

    >
      <template #trigger>
        <div class="absolute bottom-[50px] right-[20px]" :class="chatCount>0 && 'shake-button'">
          <n-badge :value="chatCount">
            <n-button circle text size="large">
              <template #icon>
                <n-icon size="32" class="text-primary">
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
  </div>

</template>

<style scoped lang="scss">
.shake-button {
  animation: shake-lr 1s cubic-bezier(0.455, 0.030, 0.515, 0.955) infinite;
}
@keyframes shake-lr {
  0%,
  100% {
    transform: rotate(0deg);
    -webkit-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
  }
  10% {
    transform: rotate(8deg);
  }
  20%,
  40%,
  60% {
    transform: rotate(-20deg);
  }
  30%,
  50%,
  70% {
    transform: rotate(0deg);
  }
  80% {
    transform: rotate(0deg);
  }
  90% {
    transform: rotate(deg);
  }
}

</style>