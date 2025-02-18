<script setup>
import {CloudArrowUp24Regular, DocumentLink24Regular, Delete48Filled} from "@vicons/fluent"
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({
  multiple:{
    type: Boolean,
    default: true
  },
  showDelete:{
    type: Boolean,
    default: true
  },

})

const inputFileRef = ref(null)
const files = defineModel("files", {default: []})
const emits = defineEmits(['onDelete'])
const onFile = ()=>{
  inputFileRef.value.click()
}
const onUpload =async (v)=> {
  const list = v.target.files
  if(props.multiple){
    for(let i=0;i<list.length;i++){
      let file = list[i]
      files.value.push({
        id: uuidv4(),
        name: file.name,
        file,
      })
    }
  }else{
    files.value = [
      {
        id: uuidv4(),
        name: v.target.files[0].name,
        file:v.target.files[0],
      }
    ]
  }

}

const onDelete = (v)=> {
  if(v.file){
    files.value = files.value.filter((x)=>x.id !== v.id)
  }else{
    emits('onDelete',v)
  }
}


</script>

<template>
  <div class="flex w-full flex-col">
    <div>
      <n-button style="width: 100%" @click="onFile" type="default" secondary>
        <template #icon>
          <CloudArrowUp24Regular/>
        </template>
        {{$t('content.attachFile')}}
      </n-button>
      <input @change="onUpload" v-show="false" type="file" ref="inputFileRef" :multiple="multiple" />
    </div>
    <template v-if="$slots.content">
      <slot name="content" :files="files" :onDelete="onDelete" />
    </template>
    <div v-else class="flex flex-wrap mt-3 gap-2">
      <template v-for="(item,idx) in files" :key="idx">
        <div class=" flex items-center gap-2 p-2 border
        border-surface-line rounded-md min-w-[100px] max-w-[300px] cursor-pointer bg-white hover:bg-surface-100 relative overflow-hidden ui__upload pr-6">
          <n-icon size="18" class="text-surface-400">
            <DocumentLink24Regular/>
          </n-icon>
          <span class="text-xs line-clamp-1">{{item.name}}</span>
          <span class="inline-block absolute right-[4px] top-[6px] opacity-0 ui__upload-icon transition-all duration-300 ">
            <n-icon v-if="showDelete" size="20" class="text-danger"  @click="onDelete(item)">
              <Delete48Filled/>
            </n-icon>
          </span>
        </div>
      </template>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.ui__upload{
  &:hover{
    .ui__upload-icon{
      opacity: 1;
    }
  }
}
</style>