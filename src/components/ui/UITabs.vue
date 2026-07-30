<script setup>
  defineProps({
    modelValue: { type: [String, Number], required: true },
    tabs: { type: Array, required: true } // [{ name, label }]
  })
  defineEmits(['update:modelValue'])
</script>

<template>
  <div
    class="inline-flex items-center gap-1 p-1 rounded-2xl bg-surface-ground-soft border border-surface-line"
  >
    <button
      v-for="(tab, idx) in tabs"
      :key="tab.name"
      type="button"
      class="px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors cursor-pointer"
      :class="[
        tabs.length === 1
          ? 'rounded-xl'
          : idx === 0
            ? 'rounded-l-xl rounded-r-md'
            : idx === tabs.length - 1
              ? 'rounded-r-xl rounded-l-md'
              : 'rounded-md',
        modelValue === tab.name
          ? 'bg-surface-section text-textColor0 font-semibold'
          : 'bg-transparent text-textColor2 font-medium hover:text-textColor0'
      ]"
      @click="$emit('update:modelValue', tab.name)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
