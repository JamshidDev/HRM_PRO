<script setup>
import navigation from "@/layouts/Main/data/navigation.js"
import {ChatVideo20Regular} from "@vicons/fluent"

const sidebar = ref(true)
const layoutClass = computed(()=>({
  open__sidebar:sidebar.value,
  close__sidebar:!sidebar.value,
}))
</script>

<template>
<div
    class="main__layout"
    :class="layoutClass"
>
  <div class="sidebar__section">
    <template v-for="(item, idx) in navigation" :key="idx">

      <template v-if="item?.children && item.children.length>0">

      </template>
      <template v-else>
        <div class="list__item">
          <div class="list__icon">
            <n-icon :component="ChatVideo20Regular" />
          </div>
          <div class="list__label">
            {{item.label}}
          </div>
        </div>
      </template>

    </template>
  </div>


  <div class="main__section">
    <n-button @click="sidebar=!sidebar">Button</n-button>
  </div>
</div>
</template>

<style scoped>

</style>