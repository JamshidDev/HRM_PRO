<!-- ui/Edocument/shared/DocumentTab.vue -->
<script setup>
  defineProps({
    tabs: { type: Array, required: true }, // [{ id, label, icon }]
    activeId: { type: Number, required: true }
  })
  defineEmits(['update:activeId'])
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="tab in tabs"
      class="rounded-xl flex justify-center items-center px-3 py-1.5 gap-1.5 border cursor-pointer duration-200 text-sm font-medium text-nowrap"
      :key="tab.id"
      type="button"
      :class="
        tab.id === activeId
          ? 'bg-primary border-primary text-white shadow-sm'
          : 'bg-surface-ground border-surface-line text-textColor0/70 hover:text-textColor0 hover:border-primary/40'
      "
      @click="$emit('update:activeId', tab.id)"
    >
      <n-icon v-if="tab.icon" size="16" :color="tab.id === activeId ? '#ffffff' : undefined">
        <component :is="tab.icon" />
      </n-icon>
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>
