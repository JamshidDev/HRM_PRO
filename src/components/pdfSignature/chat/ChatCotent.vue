<script setup>
import ChatInput from "./ChatInput.vue"
import MessageContent from "./MessageContent.vue"
import ChatDate from "./ChatDate.vue"
import {usePdfViewerStore, useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
const store = usePdfViewerStore()
const accountStore = useAccountStore()

const currentDate = ref(null)

onMounted(()=>{
  store._messages()
  store._chatUsers()
})

const users = computed(()=>{
  const list = store.userList.filter(v=>v.id !== accountStore.account?.id)
  if(list.length>0){
    store.payload.recipient_id = list[0].id
  }
  return list
})

const messages = computed(()=>{
  return store.messageList.filter((v)=>(store.payload.recipient_id === v.recipient.id || store.payload.recipient_id === v.sender.id)).map((v)=>({
    msg:v.message,
    author:v.sender.id === accountStore.account.id,
    fullName:v.sender?.worker?.last_name +" "+v.sender?.worker?.first_name,
    avatar:v.sender.photo,
    time:Utils.timeOnlyHour(v.created_at),
    date:Utils.timeOnlyDate(v.created_at),
    id:v.id
  }))
})


const checkTime = (time)=>{
  if(time !== currentDate.value){
    currentDate.value = time
    return true
  }else return  false
}

const onDelete = (v)=>{
  store._deleteMessage(v.id)
}




</script>

<template>
<div class="flex flex-col w-full h-[500px]">
  <n-select
      class="mb-1"
      size="small"
      v-model:value="store.payload.recipient_id"
      filterable
      :placeholder="$t(`content.choose`)"
      :options="users"
      label-field="name"
      value-field="id"
      :loading="store.userLoading"
  />
    <div
        style="height: calc(100vh - 230px)"
        class="flex flex-col-reverse border
        w-full h-full
        border-surface-line rounded-lg mb-1 bg-surface-ground
         overflow-x-hidden overflow-y-auto">
      <template v-for="(item, idx) in messages" :key="idx">
        <MessageContent
            :message="item.msg"
            :author="item.author"
            :full-name="item.fullName"
            :avatar="item.avatar"
            :time="item.time"
            @onDelete="onDelete(item)"
        />
        <ChatDate v-if="idx+1 === messages.length || checkTime(item.date)" :date="item.date" />
      </template>
      <n-spin :show="store.chatLoading" class="h-full flex justify-center items-center">
        <div v-if="messages.length === 0" class="h-full text-surface-300 flex justify-center items-center">
          <span>{{$t('content.no-message')}}</span>
        </div>
      </n-spin>
    </div>


  <ChatInput/>
</div>
</template>

<style scoped>
textarea {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

textarea::-webkit-scrollbar {
  display: none;
}
</style>