<script setup>
  defineProps({
    title: {
      type: String,
      required: true
    },
    icon: {
      type: Object,
      default: null
    }
  })
</script>

<template>
  <div class="rounded-3xl overflow-hidden mb-6">
    <div
      class="section-header-bar flex items-center justify-between gap-2 bg-gradient-to-r from-[#D1E9FF] to-[#EFF8FF] rounded-t-3xl  border-surface-line px-4 py-4"
    >
      <div class="flex items-center gap-2 min-w-0">
        <n-icon v-if="icon" size="20" class="text-primary shrink-0">
          <component :is="icon" />
        </n-icon>
        <span class="font-semibold text-textColor0 truncate">{{ title }}</span>
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

<style lang="scss">
  [data-theme='dark'] {
    .section-header-bar {
      background: linear-gradient(to right, #26334d, #212b42);
    }
  }
</style>
