<script setup>
import {Search48Filled, AddCircle24Regular, Filter20Filled} from '@vicons/fluent'
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
      width:'300px',
      height:'300px'
    }
  }
})

const emits = defineEmits(['onAdd', 'onSearch'])

const searchEvent = useDebounceFn(() => {
  emits('onSearch', search.value )
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
              v-model:value="search"
              type="text"
              :placeholder="$t('content.search')"
              :on-keyup="searchEvent"

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
                  :max="15"
                  :type="'success'"
              >
                <n-button
                    @click="addEvent"
                    type="success"
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
              <span class="text-sm text-surface-400">{{$t('content.filterSetting')}}</span>
              <slot name="filterContent"></slot>
            </div>
          </n-popover>




        </div>
      </div>

    </div>
</template>

<style scoped>

</style>