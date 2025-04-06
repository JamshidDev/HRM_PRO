<script setup>
import lottie from 'lottie-web';
import WorkingTeam from "@/assets/json/workingTeam.json"

const lottieRef = ref(null)
const runAnimation = ()=>{
    if(lottieRef.value){
      lottie.loadAnimation({
        container: lottieRef.value,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: WorkingTeam
      });
    }
}

onMounted(()=>{
  runAnimation()
})

defineExpose({runAnimation})
</script>

<template>
  <div class="w-[400px] h-[400px]" id="lottieRef" ref="lottieRef"></div>
</template>
