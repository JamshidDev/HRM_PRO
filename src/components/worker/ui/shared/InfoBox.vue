<script setup>
  defineProps({
    label: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: null
    },
    icon: {
      type: Object,
      default: null
    },
    surface: {
      type: String,
      default: 'ground' // 'ground' | 'section'
    },
    iconVariant: {
      type: String,
      default: 'badge' // 'badge' | 'inline'
    },
    size: {
      type: String,
      default: 'default' // 'default' | 'large'
    }
  })
</script>

<template>
  <div
    class="flex flex-col min-w-0"
    :class="[
      surface === 'section' ? 'bg-surface-section' : 'info-box-ground',
      size === 'large' ? 'gap-2 rounded-[20px] px-5 py-3' : 'gap-1 rounded-3xl px-4 py-3'
    ]"
  >
    <div class="flex items-center gap-2">
      <template v-if="icon && iconVariant === 'inline'">
        <n-icon size="20" class="text-textColor3 shrink-0">
          <component :is="icon" />
        </n-icon>
        <span class="text-sm text-textColor3">{{ label }}</span>
      </template>
      <template v-else>
        <span v-if="icon" class="w-8 h-8 rounded-md flex items-center justify-center shrink-0">
          <n-icon size="16" class="text-primary">
            <component :is="icon" />
          </n-icon>
        </span>
        <span class="text-xs text-textColor3">{{ label }} </span>
      </template>
    </div>
    <span class="font-semibold text-textColor0 break-words">
      <slot name="value">{{ value ?? '—' }}</slot>
    </span>
  </div>
</template>

<style lang="scss">
  .info-box-ground {
    background-color: #f9fafb;
  }
  [data-theme='dark'] {
    .info-box-ground {
      background-color: var(--surface-ground);
    }
  }
</style>
