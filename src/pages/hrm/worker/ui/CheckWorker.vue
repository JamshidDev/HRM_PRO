<script setup>
import {useComponentStore} from "@/store/modules/index.js"
import {NTag, NAvatar} from "naive-ui"

const store = useComponentStore()

const renderOption = ({option}, index) => {
  return [
    h('div', {class:"w-full p-2 flex gap-x-4 hover:bg-surface-ground rounded cursor-pointer"}, [

      h(NAvatar, {
        round:true,
        src:"https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
      }),
      h('div', {class:'flex flex-col text-sm'}, [
        h('span',{class:"text-primary"}, option.fullName,),
        h('span',option.position,),
      ])
    ])
  ]
};

const onChange = ()=>{
  if(store.userPinfl.length === 17){
    let pin = store.userPinfl.split('-').join("")
    store._checkWorker(pin)
  }
}


const onSelect = (v)=>{
  console.log(v)
}

</script>

<template>
  <n-modal v-model:show="store.checkUserVisible">
    <n-card
        style="width:600px"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        class="grid grid-cols-1 card-p-none"
    >
     <div class="pb-6">
       <div class="w-full p-4">
         <span class="text-lg font-medium">{{$t('workerPage.checkWorker.title')}}</span>
       </div>
       <div class="px-4 mt-6">

         <n-auto-complete
             v-mask="`####-####-####-##`"
             v-model:value="store.userPinfl"
             @update:value="onChange"
             :options="store.results"
             :placeholder="$t('workerPage.checkWorker.jshshir')"
             :loading="store.pinLoading"
             clearable
             :render-option="renderOption"
         >
         </n-auto-complete>
       </div>
     </div>

    </n-card>
  </n-modal>
</template>
