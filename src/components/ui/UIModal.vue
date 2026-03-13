<script setup>
  import { ArrowSyncDismiss24Filled } from '@vicons/fluent'

  const visible = defineModel('visible', { type: Boolean, default: false })
  const emit = defineEmits(['click:close'])
  const props = defineProps({
    width: {
      type: [Number, String],
      default: 400
    },
    height: {
      type: [Number, String],
      default: null
    },
    title: {
      type: String,
      default: 'no-title'
    },
    persistent: {
      type: Boolean,
      default: true
    }
  })

  const onClickClose = () => {
    visible.value = false
    emit('click:close')
  }
</script>

<template>
  <n-modal
    v-model:show="visible"
    :close-on-esc="!persistent"
    :mask-closable="!persistent"
    class="ui__modal-element"
  >
    <n-card
      title="Modal"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      :style="{
        width: isNaN(width) ? width : width + 'px',
        ...(height ? { height: isNaN(height) ? height : height + 'px' } : {})
      }"
      closable
    >
      <template #default>
        <div class="flex flex-col p-2 h-full">
          <div class="w-full shrink-0">
            <slot name="header">
              <div class="flex justify-between px-4 py-2">
                <h3 class="text-lg font-medium">
                  <slot name="header-title">
                    {{ title }}
                  </slot>
                </h3>
                <n-icon @click="onClickClose" class="text-[34px] text-red-500 cursor-pointer">
                  <ArrowSyncDismiss24Filled />
                </n-icon>
              </div>
            </slot>
          </div>
          <div
            class="px-4 flex-1 min-h-0"
            :style="height ? { overflowY: 'auto' } : {}"
          >
            <slot name="default"> </slot>
          </div>
          <div class="shrink-0" v-if="$slots.footer">
            <slot name="footer"> </slot>
          </div>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>
