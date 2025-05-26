<script setup>

defineProps({
  data: {
    type: Array,
    required: true
  }
})

</script>
<template>
  <div>
    <slot name="emptyPlaceholder" v-if="!data.length"/>
    <n-popover v-if="data.length"  trigger="click" width="trigger">
      <div class="max-h-[200px] h-[200px] overflow-y-auto flex flex-col gap-1">
        <template v-for="n in (data.length-1)" :id="n">
          <slot name="content" :data="data[n]" />
        </template>
      </div>
      <template #trigger>
        <div class="flex gap-1 items-center justify-center">
          <slot name="content" :data="data[0]" />
          <n-button v-if="data.length>1" tertiary type="primary" size="tiny" circle>+{{data.length-1}}</n-button>
        </div>
      </template>
    </n-popover>

  </div>
</template>