<!-- ui/Edocument/shared/DocumentTab.vue -->
<script setup>
defineProps({
  tabs: { type: Array, required: true }, // [{ id, label, icon }]
  activeId: { type: String, required: true }
})
defineEmits(["update:activeId"])
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors"
      :class="tab.id === activeId
        ? 'bg-primary border-primary text-white'
        : 'bg-transparent border-surface-line text-textColor0/70 hover:text-textColor0 hover:border-primary/40'"
      @click="$emit('update:activeId', tab.id)"
    >
      <n-icon v-if="tab.icon" size="16" :color="tab.id === activeId ? '#ffffff' : undefined">
        <component :is="tab.icon" />
      </n-icon>
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>