<script setup>
import {ArrowSyncDismiss24Filled} from "@vicons/fluent"
const props = defineProps({
  title:{
    type:String,
    default:null,
  },
})

const visible = defineModel('visible', {type:Boolean, default:false })
</script>

<template>
  <n-drawer
      v-model:show="visible"
      :default-width="502"
      placement="right"
      resizable
      class="ui-drawer"
  >
    <n-drawer-content>
      <template #default>
        <div class="w-full flex justify-between
        border-b border-surface-line px-[20px] py-[6px]">
          <span class="text-lg font-medium">{{title}}</span>
          <span>
            <n-icon class="text-[34px] text-red-500 cursor-pointer">
              <ArrowSyncDismiss24Filled/>
            </n-icon>
          </span>
        </div>
        <div class="ui-drawer-content px-[20px] py-[10px]">
          <slot name="content"></slot>
        </div>
        <div class="ui-drawer-footer">
          <slot name="footer">

          </slot>
        </div>


      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>