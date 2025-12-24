<script setup>
import { useNotify } from '@/composables/useNotify'

const { notifications, remove } = useNotify()
</script>

<template>
  <div class="fixed top-[10px] left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[280px]">
    <TransitionGroup name="notify">
      <div
          v-for="item in notifications"
          :key="item.id"
          :class="[
          'px-4 py-2 rounded-lg shadow-lg cursor-pointer w-full',
          {
            'bg-success text-white': item.type === 'success',
            'bg-danger text-white': item.type === 'danger',
            'bg-warning text-white': item.type === 'warning',
            'bg-info text-white': item.type === 'info'
          }
        ]"
      >
        <div class="flex items-center gap-2 w-full">
          <n-icon size="28" class="shrink-0 text-white">
            <component :is="item.icon" />
          </n-icon>
          <span class="text-xs">{{ item.title }}</span>
        </div>
        <div>
          {{ item.message }}
        </div>

      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.notify-move,
.notify-enter-active,
.notify-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.notify-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.8);
}

.notify-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.notify-leave-active {
  position: absolute;
  right: 0;
}

</style>