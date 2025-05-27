<script setup>

defineProps({
  data: {
    type: Array,
    required: true
  },
  width: {
    type: Number,
    default: "trigger"
  },
  height: {
    type: Number,
    default: 200
  }
})

</script>
<template>
  <div class="inline-block">
    <slot name="emptyPlaceholder" v-if="!data.length"/>
    <n-popover v-if="data.length" :disabled="data.length<2" trigger="click" :width="width">
      <div class="overflow-y-auto flex flex-col gap-1" :style="{height: height+'px', maxHeight: height+'px'}">
        <template v-for="n in (data.length-1)" :id="n">
          <slot name="content" :data="data[n]" />
        </template>
      </div>
      <template #trigger>
        <div class="flex gap-1 items-center">
          <slot name="content" :data="data[0]" />
          <n-button :class="{invisible: !(data.length-1)}" tertiary type="primary" size="tiny" circle>+{{data.length-1}}</n-button>
        </div>
      </template>
    </n-popover>
  </div>
</template>
<style scoped>
.invisible{
  visibility: hidden ;
}
</style>