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
      width:'360px',
      height:'300px'
    }
  },
  searchLoading:{
    type:Boolean,
    default:false
  }
})

const searchModel = defineModel("search",{type:String,default:null })

const emits = defineEmits(['onAdd', 'onSearch', 'onClear'])

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
    <div class="grid grid-cols-2 gap-4">
      <div class="flex items-center gap-4">
        <n-input
            v-if="showSearchInput"
            style="max-width: 200px; width: 100%"
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
      <div class="flex items-center justify-end gap-4">
        <slot name="filterAction"></slot>
        <n-button
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
            v-if="showFilterButton"
            v-bind:style="popoverStyle"
            trigger="click"
            scrollable
            placement="bottom"
        >
          <template #trigger>
            <n-badge
                :value="filterCount"
                processing
                type="info"
                class="cursor-pointer"
            >
              <n-button
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
          <div class="flex flex-col">
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

<style scoped>

</style>