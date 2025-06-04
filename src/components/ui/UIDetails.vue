<script setup>

defineProps({
  data: {
    type: Array,
    required: true
  },
  width: {
    type: [Number, String],
    default: "trigger"
  },
  height: {
    type: Number,
    default: 200
  }
})

const emits = defineEmits(['showEv'])

</script>
<template>
  <div class="inline-block">
    <n-popover trigger="click" :width="width">
      <slot name="content">

      </slot>
      <template #trigger>
        <slot name="trigger">

        </slot>
      </template>
    </n-popover>
  </div>
</template>
<style scoped>
.invisible{
  visibility: hidden ;
}
</style>