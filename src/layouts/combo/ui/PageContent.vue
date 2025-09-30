<script setup>
import AppHeader from "./AppHeader.vue"
import {HeaderTabContainer, HeaderTabButton} from "@/components/layoutTab/index.js"
import {Star16Regular} from "@vicons/fluent"
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
<!--  <HeaderTabContainer/>-->



  <div class="main-content" id="mainContent">
    <router-view v-slot="{ Component }">
      <transition name="slide-right" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</div>
</template>
