<script setup>
import {ArrowSyncDismiss24Filled} from "@vicons/fluent"
const props = defineProps({
  title:{
    type:String,
    default:null,
  },
  width:{
    type:[Number, String],
    default:500,
  },
  height:{
    type:[Number, String],
    default:"100vh",
  },
  showMask:{
    type:Boolean,
    default:true,
  },
  maskClosable:{
    type:Boolean,
    default:true,
  },
  placement: {
    type:String,
    default:"right",
  }
})

const visible = defineModel('visible', {type:Boolean, default:false })

</script>

<template>
  <n-drawer
      :height="height"
      v-model:show="visible"
      :default-width="width"
      :placement="placement"
      resizable
      class="ui-drawer"
      :show-mask="showMask"
      :mask-closable="maskClosable"
  >
    <n-drawer-content>
      <template #default>
        <div class="w-full flex justify-between items-center
        border-b border-surface-line px-[20px] py-[6px]">
          <span class="text-lg font-medium">{{title}}</span>
          <span>
            <n-icon
                @click="visible=false"
                class="text-[34px] text-red-500 cursor-pointer">
              <ArrowSyncDismiss24Filled/>
            </n-icon>
          </span>
        </div>
        <div class="ui-drawer-content px-[20px] py-[10px]">
          <slot name="content"></slot>
        </div>

      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.ui-drawer-content{
  flex-grow: 1;
}
</style>