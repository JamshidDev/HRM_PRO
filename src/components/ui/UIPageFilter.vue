<script setup>
import {Search48Filled, AddCircle24Regular, Filter20Filled, DeleteArrowBack20Regular} from '@vicons/fluent'
const slots = useSlots()
const props = defineProps({
  title:{
    type:String,
    default:null,
  },
  showSearchInput:{
    type:Boolean,
    default:true,
  },
  showAddButton:{
    type:Boolean,
    default:true,
  },
  showFilterButton:{
    type:Boolean,
    default:true,
  },
  filterCount:{
    type:Number,
    default:0
  },
  popoverStyle:{
    type:Object,
    default:{
      width:'360px ',
      maxWidth:'100%',
      minHeight:'300px'
    }
  },
  searchLoading:{
    type:Boolean,
    default:false
  }
})
const hasFullFilterSlot = !!slots.fullFilterContent
const searchModel = defineModel("search",{type:String,default:null })

const emits = defineEmits(['onAdd', 'onSearch', 'onClear', 'show',])

let timeout = null
const searchEvent = ()=>{

  clearTimeout(timeout)
  timeout = setTimeout(()=>{
    emits('onSearch', searchModel.value )
  },1000)
}


const addEvent = ()=>{
  emits('onAdd')
}




</script>

<template>
  <div class="grid grid-cols-1">
    <div v-if="title"><span class="text-lg font-semibold inline-block mb-2 text-surface-600">{{title}}</span></div>
    <div class="flex flex-col md:flex-row gap-4">
      <div class="w-full md:max-w-[200px] flex items-start">
        <n-input
            clearable
            class="w-full md:max-w-[200px]! md:w-full! skip-format"
            v-if="showSearchInput"
            v-model:value="searchModel"
            type="text"
            :placeholder="$t('content.search')"
            :on-keyup="searchEvent"
            @paste="searchEvent"
            @clear="searchEvent"
            :loading="searchLoading"
        >
          <template #suffix>
            <n-icon :component="Search48Filled" />
          </template>
        </n-input>
        <slot name="filterSearch"></slot>
      </div>
      <div class="flex flex-wrap w-full md:w-[calc(100%-200px)] justify-end gap-4">
        <slot name="filterAction"></slot>
        <n-button
            class="w-full! md:w-auto!"
            v-if="showAddButton"
            type="primary"
            icon-placement="right"
            @click="addEvent"
        >
          <template #icon>
            <n-icon>
              <AddCircle24Regular/>
            </n-icon>
          </template>
          {{$t('content.add')}}
        </n-button>
        <n-popover
            @update:show="(v)=>emits('show',v)"
            v-if="showFilterButton"
            trigger="click"
            scrollable
            placement="bottom"
            class="max-w-full w-(--v-target-width) md:w-auto md:min-w-[400px] h-[400px]"
            :style="{'--top-activator-width': 'var(--v-target-width)'}"
        >
          <template #trigger>
            <n-badge
                class="w-full! md:w-auto!"
                :value="filterCount"
                processing
                type="info"
            >
              <n-button
                  class="w-full! md:w-auto!"
                  type="primary"
                  ghost
                  icon-placement="right"
              >
                <template #icon>
                  <n-icon>
                    <Filter20Filled/>
                  </n-icon>
                </template>
              </n-button>
            </n-badge>
          </template>
          <div class="flex flex-col w-full">
            <div class="flex justify-between">
              <span class="text-sm text-surface-400">{{$t('content.filterSetting')}}</span>
              <n-button
                  @click="emits('onClear')"
                  strong
                  secondary
                  type="error"
                  size="tiny"
                  class="shadow">
                {{$t('content.clear')}}
                <template #icon>
                  <DeleteArrowBack20Regular/>
                </template>
              </n-button>
            </div>
            <slot name="filterContent"></slot>
          </div>
        </n-popover>
      </div>
    </div>
    <div v-if="hasFullFilterSlot" class="w-full">
      <slot name="fullFilterContent"></slot>
    </div>


  </div>
</template>
