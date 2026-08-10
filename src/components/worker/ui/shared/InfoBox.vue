<script setup>
  const props = defineProps({
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
      default: 'ground' // 'ground' | 'section' | 'transparent'
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

  const surfaceClass = computed(() => {
    if (props.surface === 'section') return 'bg-surface-section'
    if (props.surface === 'transparent') return ''
    return 'info-box-ground'
  })

  // Shaffof variant o'zi turgan kartaning padding'iga tekislanadi
  const paddingClass = computed(() => {
    if (props.surface === 'transparent') return 'px-0'
    return props.size === 'large' ? 'px-5' : 'px-4'
  })
</script>

<template>
  <div
    class="flex flex-col min-w-0"
    :class="[
      surfaceClass,
      paddingClass,
      size === 'large' ? 'gap-2 rounded-[20px] py-3' : 'gap-1 rounded-3xl py-3'
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
