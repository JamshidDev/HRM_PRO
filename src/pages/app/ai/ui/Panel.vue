<script setup>
import {useAIConversationStore} from "@/store/modules/index.js"
import {ChatMultiple24Regular, PanelRight28Filled} from "@vicons/fluent"

const store = useAIConversationStore()
const containerRef = ref(null)

const onSelect = (v)=>{
  if(!store.historyMode){
    store.archiveMessage = [...store.messages]
  }
  store.historyMode = true

  store.questionParams.date = v.date
  store.questionParams.page = 1
  store.questions()
}

const containerScrollEv = ()=>{
  const container =containerRef.value

  container.addEventListener('scroll', () => {
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight === scrollHeight && !store.listLoading && store.totalList>store.list.length) {
      store.listParams.page ++
      store.getList(true)
    }
  });
}

onMounted(()=>{
  containerScrollEv()
  store.getList()
})
</script>

<template>
<div ref="containerRef" class="flex flex-col overflow-y-auto bg-surface-section" style="height: calc(100vh - 60px)">
  <div class="flex pt-2 px-1 border-b border-surface-line mb-4 text-[#90A1B9]">
    <div class="w-[24px]">
      <n-icon size="24" class="text-[#90A1B9] cursor-pointer text-wrap">
        <PanelRight28Filled/>
      </n-icon>
    </div>
    <div class="text-center font-medium" style="width: calc(100% - 24px)">
        {{$t('aiConversation.form.conversation')}}
    </div>
  </div>
  <n-spin :show="store.listLoading">
    <template v-for="(item,index) in store.list">
      <div
          @click="onSelect(item)"
          class="flex rounded-lg px-3 py-1 mb-2 bg-gray-50 cursor-pointer
          bg-linear-to-r from-gray-100 to-blue-100 from-30%
           mx-[4px] hover-effect-card text-textColor0" style="width: calc(100% - 8px)">
        <div class="w-[22px] flex justify-center items-center">
          <n-icon size="20" class="text-gray-400">
            <ChatMultiple24Regular/>
          </n-icon>
        </div>
        <div style="width: calc(100% - 22px)" class="pl-1">
          <div class="truncate w-full font-medium leading-[1.2]">{{item.question}}</div>
          <div class="truncate w-full text-secondary leading-[1.2] text-xs" v-html="item.answer"></div>
          <div class="truncate w-full text-[11px] font-semibold">{{item.date}}</div>
        </div>

      </div>
    </template>
  </n-spin>

</div>
</template>
<style>
.hover-effect-card{
  cursor: pointer;
  transform: scale(1);
  transition: 0.2s ease;

  &:hover{
    transform: scale(1.04);
    z-index: 10;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
}
</style>