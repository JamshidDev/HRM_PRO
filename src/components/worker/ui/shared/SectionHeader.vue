<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    default: null
  },
  iconChip: {
    type: Boolean,
    default: false
  },
  plain: {
    type: Boolean,
    default: false
  },
  fullHeight: {
    type: Boolean,
    default: false
  },
  tightBody: {
    type: Boolean,
    default: false
  },
  large: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="rounded-3xl overflow-hidden section-header p-1" :class="[fullHeight && 'h-full flex flex-col']">
    <div
      class="section-header-bar flex items-center justify-between gap-2 rounded-t-3xl border-surface-line px-4 py-2 shrink-0"
    >
      <slot name="header">
        <div class="flex items-center gap-2 min-w-0">
          <span
            v-if="icon && iconChip"
            class="rounded-md bg-primary flex items-center justify-center shrink-0"
            :class="large ? 'w-9 h-9' : 'w-8 h-8'"
          >
            <n-icon :size="large ? 20 : 18" class="text-white">
              <component :is="icon" />
            </n-icon>
          </span>
          <n-icon v-else-if="icon" :size="large ? 24 : 20" class="text-primary shrink-0">
            <component :is="icon" />
          </n-icon>
          <span
            class="font-semibold text-textColor0 truncate"
            :class="large ? 'text-lg' : 'text-sm'"
          >{{ title }} </span>
          <slot name="title-suffix" />
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <slot name="trailing" />
        </div>
      </slot>
    </div>
    <div
      :class="[
        plain ? 'bg-surface-section' : 'bg-surface-ground',
        fullHeight && 'flex-1 overflow-auto',
        tightBody ? 'px-2 py-3' : 'p-4',
        !$slots.footer && 'rounded-b-3xl'
      ]"
    >
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="section-header-bar flex items-center justify-end gap-2 rounded-b-3xl border-surface-line px-4 py-2 shrink-0"
    >
      <slot name="footer" />
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
    background-color: var(--table-header);
  }
  .section-header {
    background-color: var(--surface-section);
  }

}


</style>
