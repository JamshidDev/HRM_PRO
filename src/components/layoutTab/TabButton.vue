<script setup></script>

<template>
  <div
    class="tab-buttons border-r border-surface-line flex justify-center items-center px-3 py-1 gap-1 text-secondary cursor-pointer relative before:content-[''] before:absolute before:right-0 before:bottom-0 before:w-0 before:transition-all hover:before:w-full before:h-[2px] before:duration-300 hover:before:left-0 text-nowrap"
  >
    <slot></slot>
  </div>
</template>
