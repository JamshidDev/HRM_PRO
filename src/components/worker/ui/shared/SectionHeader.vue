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
    },
    plainFooter: {
      type: Boolean,
      default: false
    }
  })
</script>

<template>
  <div
    class="rounded-3xl overflow-hidden section-header p-1"
    :class="[fullHeight && 'h-full flex flex-col']"
  >
    <div
      class="section-header-bar section-header-top flex items-center justify-between gap-2 rounded-t-3xl border-surface-line px-4 py-2 shrink-0"
    >
      <slot name="header">
        <div class="flex items-center gap-2 min-w-0">
          <n-icon v-if="icon" :size="large ? 24 : 20" class="text-primary shrink-0">
            <component :is="icon" />
          </n-icon>
          <span
            class="font-semibold text-primary truncate"
            :class="large ? 'text-lg' : 'text-sm'"
          >{{ title }}
          </span>
          <slot name="title-suffix" />
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <slot name="trailing" />
        </div>
      </slot>
    </div>
    <div
      :class="[
        'bg-surface-section',
        fullHeight && 'flex-1 overflow-auto',
        tightBody ? 'px-2 py-3' : 'p-4',
        !$slots.footer && 'rounded-b-3xl'
      ]"
    >
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="flex items-center justify-end gap-2 rounded-b-3xl border-surface-line px-4 py-2 shrink-0"
      :class="!plainFooter && 'section-header-bar'"
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
    background-color: #eff8ff;
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
