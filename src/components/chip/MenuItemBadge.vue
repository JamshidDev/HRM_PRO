<script setup>
import { ref, watch, computed } from 'vue'
import { useSocketStore } from "@stores"
import SortBtn from "@pages/accountant/monthReport/ui/SortBtn.vue"

const store = useSocketStore()
const isRippling = ref(false)

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  field: {
    type: String,
  }
})

const value = computed(() => {
  return props.field?  store.getCount(props.category, props.field) : 0
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