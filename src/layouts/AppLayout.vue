<script setup>
import {useRoute} from "vue-router";
import {AppLayouts} from "@/utils/index.js";
import Combo from "./combo/Combo.vue";
import Empty from "./empty/Empty.vue";
import {useAccountStore} from "@/store/modules/app/accountStore.js";
import {navigations, otherNavigations} from "@/layouts/data/navigations.js"


const route = useRoute()
const store = useAccountStore()
const isLoadApp = ref(false)

const layout = computed(() => {
  switch (route?.meta?.layout) {
    case AppLayouts.empty:
      return Empty
    default:
      return Combo
  }
})

watchEffect(()=>{
  const list = navigations.flatMap((v)=>(v.children))
  const currentItem = [...list, ...otherNavigations].filter((v)=>v.path === route.path)
  if(currentItem.length>0){
    window.document.title ="HRM PRO | " + currentItem[0].label
  }
})

watch(route, (value)=>{
 if(value.meta.layout !== AppLayouts.empty && isLoadApp.value){
    isLoadApp.value = false
    store._index()
  }
})

onMounted(()=>{
  isLoadApp.value = true

})


</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
