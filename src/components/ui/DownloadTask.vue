<script setup>
import {ArrowCircleDownUp20Regular} from "@vicons/fluent"
</script>

<template>
  <n-popover
      class="!p-0"
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
    <div class="w-[260px] h-[200px] cursor-pointer bg-surface-ground" >
      <div class="w-full border-b border-surface-line px-2 py-2 text-xs font-semibold">
          Bildirishnomalar
      </div>
      <div class="w-full h-[calc(100%-58px)]">

      </div>
      <div class="w-full text-center border-t border-surface-line px-2 py-1 text-xs">
        Barchasini ko'rish
      </div>
    </div>
  </n-popover>
</template>
