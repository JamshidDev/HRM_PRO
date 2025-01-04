<script setup>
import { DismissCircle20Regular, ErrorCircle24Filled, CloudCheckmark28Regular,ArrowCircleRight16Regular} from "@vicons/fluent"
const props = defineProps({
  type:{
    type:String,
    default:'success',
  },
  closeBtnText:{
    type:String,
    default:'content.close',
  },
  submitBtnText:{
    type:String,
    default:'content.save',
  },
  saveLoading:{
    type:Boolean,
    default:false,
  }
})

const visible = defineModel("visible", {
  type:Boolean,
  default:false
})

const emits = defineEmits(['onClose', 'onSave'])


</script>

<template>
  <n-modal v-model:show="visible">
    <n-card
        style="width:460px"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        class="grid grid-cols-1 card-p-none cursor-pointer"
    >
      <div>
        <slot name="icon">
          <div class="flex flex-col p-4">
            <template v-if="type === 'success'">
              <n-icon size="64" class="text-success mx-auto">
                <CloudCheckmark28Regular/>
              </n-icon>
            </template>
            <template v-else-if="type === 'warning'">
              <n-icon size="64" class="text-warning mx-auto">
                <ErrorCircle24Filled/>
              </n-icon>
            </template>
          </div>
        </slot>
      </div>
      <div class="px-6">
        <slot></slot>
      </div>
      <div class="p-4 mt-4 flex-col flex">
        <slot name="action">
          <template v-if="type === 'success'">
            <div class="grid grid-cols-2 gap-2">
              <n-button
                  ghost
                  class="w-full"
                  type="error"
                  icon-placement="left"
                  @click="emits('onClose')"
              >
                <template #icon>
                  <n-icon>
                    <DismissCircle20Regular/>
                  </n-icon>
                </template>
                {{$t(closeBtnText)}}
              </n-button>
              <n-button
                  class="w-full"
                  type="primary"
                  icon-placement="right"
                  @click="emits('onSave')"
                  :loading="saveLoading"
              >
                <template #icon>
                  <n-icon>
                    <ArrowCircleRight16Regular/>
                  </n-icon>
                </template>
                {{$t(submitBtnText)}}
              </n-button>
            </div>
          </template>
          <template v-else-if="type === 'warning'">
            <n-button
                class="w-full"
                type="warning"
                icon-placement="right"
                @click="emits('onClose')"
            >
              <template #icon>
                <n-icon>
                  <DismissCircle20Regular/>
                </n-icon>
              </template>
              {{$t(closeBtnText)}}
            </n-button>
          </template>
        </slot>
      </div>
    </n-card>
  </n-modal>
</template>
