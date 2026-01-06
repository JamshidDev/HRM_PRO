<script setup>
  import { useNotify } from '@/composables/useNotify'

  const { notifications, remove } = useNotify()
</script>

<template>
  <div class="fixed top-[50px] left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[280px]">
    <TransitionGroup name="notify">
      <div
        v-for="item in notifications"
        :key="item.id"
        :class="[
          'rounded-lg shadow-lg cursor-pointer w-full border border-surface-line bg-surface-section shadow-sm'
        ]"
      >
        <div class="px-4 py-2 bg-gradient-to-b from-dark/3 to-dark/1 text-secondary">
          <div class="flex items-center gap-2 w-full">
            <n-icon size="18" class="shrink-0">
              <component :is="item.icon" />
            </n-icon>
            <span class="text-xs line-clamp-1 font-medium">{{ item.title }}</span>
          </div>
          <div class="text-xs mt-2">
            {{ item.message }}
          </div>
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
    transform: translateY(-100px) scale(0.8);
  }

  .notify-leave-active {
    position: absolute;
    right: 0;
  }
</style>
