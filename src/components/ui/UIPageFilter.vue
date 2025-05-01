<script setup>
import {Search48Filled, AddCircle24Regular, Filter20Filled, DeleteArrowBack20Regular} from '@vicons/fluent'
import { useDebounceFn } from '@vueuse/core'
const search = ref(null)


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

const searchModel = defineModel("search",{type:String,default:null })

const emits = defineEmits(['onAdd', 'onSearch', 'onClear', 'show',])

const searchEvent = useDebounceFn(() => {
  emits('onSearch', searchModel.value )
}, 300, )


const addEvent = ()=>{
  emits('onAdd')
}


</script>

<template>
  <div class="grid grid-cols-1">
    <div v-if="title"><span class="text-lg font-semibold inline-block mb-2 text-surface-600">{{title}}</span></div>
    <div class="grid grid-cols-12 gap-2 md:gap-4">
      <div class="col-span-12 md:col-span-6 flex items-center">
        <n-input
            class="w-full md:!max-w-[200px] md:!w-full"
            v-if="showSearchInput"
            v-model:value="searchModel"
            type="text"
            :placeholder="$t('content.search')"
            :on-keyup="searchEvent"
            :loading="searchLoading"
        >
          <template #suffix>
            <n-icon :component="Search48Filled" />
          </template>
        </n-input>
        <slot name="filterSearch"></slot>
      </div>
      <div class="col-span-12 md:col-span-6 flex flex-col md:flex-row items-center justify-end gap-2 md:gap-4">
        <slot name="filterAction"></slot>
        <n-button
            class="!w-full md:!w-auto"
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
            class="max-w-full min-w-[360px] h-[400px]"

        >
          <template #trigger>
            <n-badge
                class="!w-full md:!w-auto"
                :value="filterCount"
                processing
                type="info"
            >
              <n-button
                  class="!w-full md:!w-auto"
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

  </div>
</template>
