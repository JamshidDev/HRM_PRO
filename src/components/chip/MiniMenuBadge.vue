<script setup>
import { useSocketStore} from "@stores"

const store = useSocketStore()
const isRippling = ref(false)
const props = defineProps({
  category:{
    type: String,
    default: ()=> null,
  }
})

const value = computed(() =>{
  return props.category? store.getCategoryTotal(props.category) : 0
})

  watch(value, () => {
    isRippling.value = true
    setTimeout(() => {
      isRippling.value = false
    }, 600)
  })
</script>

<template>
<span class="absolute top-[6px] right-[-2px]">
  <n-badge v-if="value" type="warning" class="mini-menu-badge" :value="value" :max="100" dot/>
   <span
       v-if="isRippling"
       class="absolute inset-0 rounded-full animate-ping bg-primary opacity-75"
   />
</span>
</template>