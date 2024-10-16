<script setup>
import {Edit16Regular, Delete28Regular, AppRecent24Regular} from "@vicons/fluent"
</script>

<template>
<div class="flex gap-2 items-center">

  <slot name="first"></slot>

  <n-button strong secondary circle type="success">
    <template #icon>
      <n-icon><AppRecent24Regular /></n-icon>
    </template>
  </n-button>

  <n-button strong secondary circle type="info">
    <template #icon>
      <n-icon><Edit16Regular /></n-icon>
    </template>
  </n-button>

  <n-button strong secondary circle type="error">
    <template #icon>
      <n-icon><Delete28Regular /></n-icon>
    </template>
  </n-button>

  <slot name="last"></slot>

</div>
</template>

<style scoped>

</style>