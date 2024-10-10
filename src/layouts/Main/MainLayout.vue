<script setup>
import {computed, ref} from "vue";
import AppSidebar from "@/layouts/Main/AppSidebar.vue";
import AppHeader from "@/layouts/Main/AppHeader.vue";
import {useAccountStore} from "@/store/modules/accountStore.js";
const store = useAccountStore()



const sidebar = ref(true)
const layoutClass = computed(()=>({
  open__sidebar:sidebar.value,
  close__sidebar:!sidebar.value,
}))

const controlSidebar=(v)=>sidebar.value =v

onMounted(()=>{
  store._account()
})
</script>

<template>
  <div
      class="layout__v4"
      :class="layoutClass"
  >
    <div class="sidebar__section">
      <!--    Sidebar section-->
      <AppSidebar/>
    </div>

    <div class="main__section">
      <!--    Main page section-->
      <AppHeader
          :sidebarOption="sidebar"
          @on-click="controlSidebar"
      />
<!--      <router-view />-->
      <router-view v-slot="{ Component }">
        <transition name="slide-right" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <div v-if="sidebar" @click="controlSidebar(false)" class="mobile_overall"></div>
  </div>
</template>

<style>

.slide-right-enter-active {
  transition: all 0.2s linear;
}

.slide-right-leave-active {
  transition: all 0.2s linear;
}

.slide-right-enter-from {
  transform: translateX(50px);

  opacity: 0;
}

.slide-right-enter-to {
  transform: translateX(0px);
  opacity: 1;
}

.slide-right-leave-from {
  transform: translateX(0px);
  opacity: 1;
}
.slide-right-leave-to{
  transform: translateX(-50px);
  opacity: 0;
}
</style>
