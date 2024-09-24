<script setup>
import {Search48Filled, AddCircle24Regular, Filter20Filled} from '@vicons/fluent'
const search = ref(null)


const props = defineProps({
  showSearch:{
    type:Boolean,
    default:true,
  }
})
</script>

<template>
    <div class="grid grid-cols-1">
      <div><span class="text-lg font-semibold inline-block mb-2 text-surface-600">Kategoriyalar ro'yhati</span></div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-4">
          <n-input
              v-if="showSearch"
              style="max-width: 200px; width: 100%"
              v-model:value="search"
              type="text"
              :placeholder="$t('content.search')"

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
              type="success"
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
              style="
            width:300px;
            height:300px"
              trigger="click"
              scrollable
              placement="bottom"
          >
            <template #trigger>
              <n-badge
                  :value="2"
                  :max="15"
                  :type="'success'"
              >
                <n-button
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