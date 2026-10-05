<script setup>
  import { Delete20Regular } from '@vicons/fluent'

  // Xavfli amal (o'chirish / uzish) uchun ixcham tasdiqlash popover'i:
  // rangli ikonka, sarlavha, izoh va ikkita teng tugma.
  defineProps({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    confirmText: { type: String, required: true },
    icon: { type: Object, default: () => Delete20Regular },
    placement: { type: String, default: 'bottom-end' }
  })
  const emit = defineEmits(['confirm'])

  const show = ref(false)

  const onConfirm = () => {
    show.value = false
    emit('confirm')
  }
</script>

<template>
  <n-popover
    v-model:show="show"
    trigger="click"
    :placement="placement"
    :show-arrow="false"
    raw
    @click.stop
  >
    <template #trigger>
      <slot name="trigger" />
    </template>

    <div
      class="w-[260px] rounded-xl border border-surface-line bg-surface-section p-3 shadow-lg"
      @click.stop
    >
      <div class="flex items-start gap-2.5">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-fig-red-100 text-fig-text-red"
        >
          <n-icon size="16"><component :is="icon" /></n-icon>
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[13px] font-semibold text-textColor0 leading-tight">{{ title }}</div>
          <div
            v-if="description"
            class="mt-1 text-[11px] text-textColor3 leading-snug break-words"
          >
            {{ description }}
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-3">
        <n-button size="small" secondary @click="show = false">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button size="small" type="error" @click="onConfirm">
          {{ confirmText }}
        </n-button>
      </div>
    </div>
  </n-popover>
</template>
