<script setup>
import {useAIConversationStore} from "@/store/modules/index.js"
import Keyboard from "./ui/Keyboard.vue"
import Message from "./ui/Message.vue"
import Disclaimer from "./ui/Disclaimer.vue"
import Panel from "./ui/Panel.vue"

const store = useAIConversationStore()
const chatContainer = ref(null)
const scrollToBottom=(el)=>{
  el.scrollTo({
    top: el.scrollHeight,
    behavior: 'smooth'
  })
}



watch(()=>store.messages,
    async (async)=>{
      await nextTick()
      console.log('tick')
      const el = chatContainer.value
      if (!el) return
      scrollToBottom(el)
    }, { deep: true }
)

onUnmounted(()=>{
  store.controller?.abort()
})
</script>

<template>
  <div class="w-full flex h-full bg-[#F8FAFC]">
    <div class="flex flex-col" style="width: calc(100% - 300px)">
      <div class="mx-auto w-full max-w-[1200px] relative px-4" style="height: calc(100vh - 80px)">
        <div ref="chatContainer" class="scroll-smooth mx-auto w-full relative flex flex-col overflow-y-scroll overflow-x-hidden pt-6 overscroll-none" style="height: calc(100vh - 130px)">

          <Disclaimer/>
          <template v-for="message in store.messages" :key="message.id">
            <Message
                :data="message"
            />
          </template>


        </div>
        <Keyboard
            style="transform: translateX(-50%); left: 50%"
            class="absolute bottom-0 w-[800px]"
        />
      </div>
    </div>
    <div class="w-[300px] border h-full overflow-hidden">
      <Panel/>
    </div>

  </div>


</template>