<script setup>
import {FullScreenMaximize16Regular, AddCircle28Regular} from '@vicons/fluent'
import {useReportStore} from "@/store/modules/index.js"
const store = useReportStore()
</script>

<template>
<div
    class="w-full rounded-lg bg-surface-ground"
    style="min-height: calc(100vh - 80px)"
    :class="[store.fullScreen && 'container-fullscreen']"
>
  <div class="w-full flex justify-between px-2 py-1 border-b border-surface-line mb-2">
    <div class="flex items-center gap-2">
      <n-breadcrumb>
        <template v-for="item in store.barList.sort((a,b)=>a.id - b.id)" :key="item.id">
          <n-breadcrumb-item
              class="cursor-pointer text-primary"
              @click="store.addPanel(item)"
          >
            <n-icon :component="AddCircle28Regular" /> {{item.name}}
          </n-breadcrumb-item>
        </template>
      </n-breadcrumb>
    </div>
      <n-button
          @click="store.changeScreenMode()"
          circle size="small">
        <template #icon>
          <FullScreenMaximize16Regular/>
        </template>
      </n-button>
  </div>
  <TransitionGroup
      tag="div"
      name="grid-fade"
      class="flex gap-2 w-full px-2"
  >
    <slot name="default"></slot>
  </TransitionGroup>

</div>
</template>

<style>
  .container-fullscreen {
    position: fixed;
    width: 100% !important;
    height: 100% !important;
    top: 0;
    left: 0;
    z-index: 999;
  }

  /* Harakatda siljishni animatsiya qilish */
  .grid-fade-move {
    transition: transform 0.4s ease, opacity 0.4s ease;
  }

  /* Kirish animatsiyasi */
  .grid-fade-enter-active {
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); /* spring-like */
  }
  .grid-fade-enter-from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  .grid-fade-enter-to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  /* Chiqish animatsiyasi */
  .grid-fade-leave-active {
    transition: all 0.3s ease-in-out;
    position: absolute;
  }
  .grid-fade-leave-from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  .grid-fade-leave-to {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }

</style>