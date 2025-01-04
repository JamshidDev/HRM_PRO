<script setup>
import AppHeader from "./AppHeader.vue"

const emits = defineEmits(['onOpen'])

const onClick = ()=>{
  emits('onOpen')
}
</script>

<template>
<div class="page-content">
<AppHeader
    @on-change="onClick"
/>
  <div class="main-content">
    <router-view v-slot="{ Component }">
      <transition name="slide-right" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</div>
</template>
