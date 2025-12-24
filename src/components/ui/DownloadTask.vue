<script setup>
import {ArrowCircleDownUp20Regular} from "@vicons/fluent"
</script>

<template>
  <n-popover
      placement="bottom"
      trigger="click"
  >
    <template #trigger>
      <n-button id="taskBtn">
        <template #icon>
          <n-icon size="28">
            <ArrowCircleDownUp20Regular/>
          </n-icon>

        </template>
      </n-button>
    </template>
    <div class="w-[260px] h-[200px]" >

    </div>
  </n-popover>
</template>
