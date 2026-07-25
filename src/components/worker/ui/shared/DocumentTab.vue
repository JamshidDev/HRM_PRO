<!-- ui/Edocument/shared/DocumentTab.vue -->
<script setup>
  import TabButton from '../../../layoutTab/TabButton.vue'

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
      class="tab-buttons border-r border-surface-line rounded-xl flex justify-center items-center px-3 py-1 gap-1 text-secondary cursor-pointer relative before:absolute before:right-0 before:w-0 duration-300 text-nowrap"
      :key="tab.id"
      type="button"
      :class="
        tab.id === activeId
          ? 'bg-primary border-primary text-white'
          : 'bg-transparent border-surface-line text-textColor0/70 hover:text-textColor0 hover:border-primary/40'
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
