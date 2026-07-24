<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    default: null
  },
  iconChip: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="rounded-3xl overflow-hidden mb-6 section-header p-1">
    <div
      class="section-header-bar flex items-center justify-between gap-2  rounded-t-3xl border-surface-line px-4 py-2">
      <div class="flex items-center gap-2 min-w-0">
        <span v-if="icon && iconChip" class="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
          <n-icon size="18" class="text-white">
            <component :is="icon" />
          </n-icon>
        </span>
        <n-icon v-else-if="icon" size="20" class="text-primary shrink-0">
          <component :is="icon" />
        </n-icon>
        <span class="font-semibold text-textColor0 truncate">{{ title }}</span>
        <slot name="title-suffix" />
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <slot name="trailing" />
      </div>
    </div>
    <div class="bg-surface-section p-4">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.section-header {
  background-color: #fff;
}
.section-header-bar {
  background-color: #EFF8FF;
}

[data-theme='dark'] {
  .section-header-bar {
    background-color: #1a2131;
  }
  .section-header {
    background-color: #212b42;
  }

}


</style>
