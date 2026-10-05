<script setup>
  const props = defineProps({
    isWorker: {
      type: Boolean,
      default: false
    }
  })

  // Ustun sarlavhalari `Indicator` chiplari bilan bir xil kenglikda (w-10),
  // shunda harflar raqamlar ustida aniq turadi.
  const list = [
    { tooltip: 'report.tooltip.P', value: 'P', cls: 'text-fig-text-secondary' },
    { tooltip: 'report.tooltip.F', value: 'F', cls: 'text-fig-text-secondary' },
    { tooltip: 'report.tooltip.V', value: 'V', cls: 'text-fig-chip-green-text' },
    { tooltip: 'report.tooltip.S', value: 'S', cls: 'text-fig-text-red' }
  ]

  const list2 = [
    { tooltip: 'report.tooltip.G', value: 'G', cls: 'text-fig-text-secondary' },
    { tooltip: 'report.tooltip.P', value: 'P', cls: 'text-fig-text-secondary' },
    { tooltip: 'report.tooltip.R', value: 'R', cls: 'text-fig-chip-amber-text' }
  ]

  const items = computed(() => (props.isWorker ? list2 : list))
</script>

<template>
  <div class="flex items-center gap-1 shrink-0">
    <n-tooltip v-for="item in items" :key="item.value" placement="top" trigger="hover">
      <template #trigger>
        <span
          class="inline-flex items-center justify-center w-10 h-6 text-xs font-semibold cursor-help"
          :class="item.cls"
        >
          {{ item.value }}
        </span>
      </template>
      <span>{{ $t(item.tooltip) }}</span>
    </n-tooltip>
  </div>
</template>
