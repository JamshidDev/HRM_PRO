<script setup>
import {ArrowSyncDismiss24Filled} from "@vicons/fluent"

const visible = defineModel("visible", {type:Boolean,default:false })
const props = defineProps({
  width:{
      type:Number,
      default:400
  },
  title:{
    type:String,
    default:'no-title'
  }
})


</script>

<template>
  <n-modal
      v-model:show="visible"
      class="ui__modal-element"
  >
    <n-card
        title="Modal"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        :style="{width:width+'px'}"
        closable
    >
      <template #default>
        <div class="flex flex-col p-2">
          <div class="w-full">
            <slot name="header">
              <div class="flex justify-between px-4 py-2">
                <h3 class="text-lg font-medium">{{title}}</h3>
                <n-icon
                    @click="visible=false"
                    class="text-[34px] text-red-500 cursor-pointer">
                  <ArrowSyncDismiss24Filled/>
                </n-icon>
              </div>
            </slot>
          </div>
          <div class="px-4">
            <slot name="default">
            </slot>
          </div>

        </div>
      </template>
    </n-card>
  </n-modal>
</template>