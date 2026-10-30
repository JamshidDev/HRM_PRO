<script setup>
  import { useSocketStore } from '@stores'

  const store = useSocketStore()
  const isRippling = ref(false)
  const props = defineProps({
    category: {
      type: String,
      default: () => null
    }
  })

  const value = computed(() => {
    return props.category ? store.getCategoryTotal(props.category) : 0
  })

  watch(value, () => {
    isRippling.value = true
    setTimeout(() => {
      isRippling.value = false
    }, 600)
  })
</script>

<template>
  <!-- Nuqta ikona qutisining yuqori-o'ng burchagida (40px, radius 16px egri chizig'i ustida).
       `flex` — inline badge'ning baseline bo'shlig'i nuqtani pastga surmasin. -->
  <span class="absolute top-[1px] right-[1px] z-[1] flex leading-none">
    <n-badge v-if="value" type="warning" class="mini-menu-badge" :value="value" :max="100" dot />
    <span
      v-if="isRippling"
      class="absolute inset-0 rounded-full animate-ping bg-primary opacity-75"
    />
  </span>
</template>
