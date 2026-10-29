<script setup>
  import { Timer24Regular } from '@vicons/fluent'

  const props = defineProps({ left: { type: Number, default: 0 } })
  const text = computed(
    () => `${Math.floor(props.left / 60)}:${String(props.left % 60).padStart(2, '0')}`
  )
</script>

<template>
  <div class="sticky top-[60px] z-40 px-4 pt-3">
    <div
      class="max-w-[800px] mx-auto flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm"
      :class="
        left > 0
          ? left <= 60
            ? 'border-warning/50 bg-warning/10 text-warning'
            : 'border-primary/30 bg-surface-section text-textColor1'
          : 'border-danger/40 bg-danger/10 text-danger'
      "
    >
      <n-icon size="20"><Timer24Regular /></n-icon>
      <span v-if="left > 0">
        {{ $t('signature.linkTimeLeft') }} <b class="tabular-nums">{{ text }}</b>
      </span>
      <span v-else class="font-medium">{{ $t('signature.linkExpiredPublic') }}</span>
    </div>
  </div>
</template>
