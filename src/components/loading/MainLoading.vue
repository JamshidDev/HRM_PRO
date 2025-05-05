<script setup>
import {useAccountStore} from "@/store/modules/app/accountStore.js";
const store = useAccountStore()
const visible = ref(true)


onMounted(()=>{
  // window.addEventListener('load',()=>{
  //   visible.value = false
  // })
})
</script>

<template>
 <div v-if="store.loading" class="w-full h-full fixed top-0 left-0 bg-surface-section z-999 flex justify-center items-center">
   <div class="page-content-loader"></div>
 </div>
</template>

<style scoped>
.page-content-loader {
  width: 50px;
  --b: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  padding: 1px;
  background: conic-gradient(#0000 10%, #1e5edd) content-box;
  -webkit-mask:
      repeating-conic-gradient(#0000 0deg,#000 1deg 20deg,#0000 21deg 36deg),
      radial-gradient(farthest-side,#0000 calc(100% - var(--b) - 1px),#000 calc(100% - var(--b)));
  -webkit-mask-composite: destination-in;
  mask-composite: intersect;
  animation:l4 1s infinite steps(10);
}
@keyframes l4 {to{transform: rotate(1turn)}}
</style>


