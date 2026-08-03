<script setup>
  import { Dismiss24Regular } from '@vicons/fluent'

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
        ...(height ? {
          height: isNaN(height) ? height : height + 'px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        } : {})
      }"
      :content-style="height ? 'flex:1;min-height:0;overflow:hidden;padding:0;display:flex;flex-direction:column;' : 'padding:0;'"
      closable
    >
      <template #default>
        <div class="flex flex-col p-2" :class="[height && 'h-full']">
          <div class="w-full shrink-0">
            <slot name="header">
              <div class="flex items-center justify-between px-4 py-2">
                <h3 class="text-lg font-semibold text-textColor1">
                  <slot name="header-title">
                    {{ title }}
                  </slot>
                </h3>
                <div
                  @click="onClickClose"
                  class="w-8 h-8 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                >
                  <n-icon size="16" class="text-textColor2">
                    <Dismiss24Regular />
                  </n-icon>
                </div>
              </div>
            </slot>
          </div>
          <div class="px-4 pb-4" :class="[height && 'flex-1 min-h-0 overflow-y-auto']">
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
