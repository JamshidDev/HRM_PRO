<script setup>
import {FullScreenMaximize16Regular, AddCircle28Regular, FullScreenMinimize24Regular} from '@vicons/fluent'
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
              class="cursor-pointer"
              @click="store.addPanel(item)"
          >
            <n-icon :component="AddCircle28Regular"/>
            <span class="pl-1 text-primary">
                 <template v-if="item.id === 1">
              {{ store.organizations?.[0]?.name || item.name}}
            </template>
            <template v-else-if="item.id === 2">
              {{ store.departments?.[0]?.name || item.name}}
            </template>
            <template v-else>{{ item.name}}</template>
            </span>
          </n-breadcrumb-item>
        </template>
      </n-breadcrumb>
    </div>
      <n-button
          @click="store.changeScreenMode()"
          circle size="small">
        <template #icon>
          <FullScreenMinimize24Regular v-if="store.fullScreen" />
          <FullScreenMaximize16Regular v-else/>
        </template>
      </n-button>
  </div>
  <TransitionGroup
      tag="div"
      name="grid-fade"
      class=" w-full px-2"
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