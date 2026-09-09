<script setup>
  import { ref, watch, computed } from 'vue'
  import { useSocketStore } from '@stores'

  const store = useSocketStore()
  const isRippling = ref(false)

  const props = defineProps({
    category: {
      type: [String, null]
    },
    // Bitta maydon yoki bir nechta (tabli sahifada — tablar yig'indisi).
    field: {
      type: [String, Array]
    }
  })

  const value = computed(() => {
    if (!props.field) return 0
    const fields = Array.isArray(props.field) ? props.field : [props.field]
    return fields.reduce((sum, name) => sum + store.getCount(props.category, name), 0)
  })

  watch(value, (newVal, oldVal) => {
    if (newVal === oldVal) return
    isRippling.value = true
    setTimeout(() => {
      isRippling.value = false
    }, 600)
  })
</script>

<template>
  <span v-if="value > 0" class="absolute top-[-4px] right-[-2px]">
    <span class="relative inline-flex">
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-badge class="menu-item-badge" :value="value" :max="99" />
        </template>
        {{ $t('message.unSignedDocumentCount') }}
      </n-tooltip>
      <span
        v-if="isRippling"
        class="absolute inset-0 rounded-full animate-ping bg-primary opacity-75"
      />
    </span>
  </span>
</template>

<style lang="scss">
  .menu-item-badge .n-badge-sup {
    background-color: var(--dark-color) !important;
  }
</style>
