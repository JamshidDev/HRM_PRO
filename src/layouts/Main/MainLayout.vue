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
      <router-view />
    </div>

    <div v-if="sidebar" @click="controlSidebar(false)" class="mobile_overall"></div>
  </div>
</template>
