<script setup>
  import {
    ArrowSort16Regular,
    ArrowSortDownLines16Regular,
    Record24Regular,
    Record32Filled
  } from '@vicons/fluent'

  const props = defineProps({
    by: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 1
    }
  })

  const active = computed(() => props.by === props.value)
</script>

<template>
  <div
    :class="[active && 'shadow-sm bg-primary/30 !border-primary']"
    class="!h-[24px] w-full flex gap-2 transition-all duration-300 items-center cursor-pointer border border-transparent rounded-lg select-none px-2 hover:border-primary hover:bg-primary/30"
  >
    <n-icon size="16">
      <template v-if="by === 'status'">
        <Record24Regular v-if="active && order === 1" />
        <Record32Filled v-else />
      </template>
      <template v-else>
        <ArrowSortDownLines16Regular
          v-if="active"
          class="transition-all"
          :class="[order === 1 ? 'rotate-180' : ' ']"
        />
        <ArrowSort16Regular v-else />
      </template>
    </n-icon>
    <slot></slot>
  </div>
</template>
