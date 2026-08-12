<script setup>
  const props = defineProps({
    icon: Object,
    title: String,
    subtitle: String,
    type: {
      type: String,
      default: 'primary'
    }
  })

  const typeClass = computed(() => {
    const classes = {
      primary: 'text-primary bg-primary/10',
      warning: 'text-warning bg-warning/10',
      dark: 'text-dark bg-dark/10',
      danger: 'text-danger bg-danger/10',
      success: 'text-success bg-success/10',
      secondary: 'text-secondary bg-secondary/10'
    }
    return classes[props.type] || classes.primary
  })
</script>

<template>
  <div class="flex items-start gap-3">
    <div
      v-if="icon"
      :class="typeClass"
      class="w-[32px] h-[32px] shrink-0 rounded-[10px] flex justify-center items-center"
    >
      <n-icon size="18">
        <component :is="icon" />
      </n-icon>
    </div>
    <div class="min-w-0">
      <h3 class="font-bold text-[15px] leading-[1.2] text-textColor0">{{ title }}</h3>
      <small v-if="subtitle" class="block text-xs text-secondary leading-[1.3] mt-0.5">
        {{ subtitle }}
      </small>
    </div>
  </div>
</template>
