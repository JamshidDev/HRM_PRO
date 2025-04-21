<script setup>
import lottie from 'lottie-web';
import WorkingTeam from "@/assets/json/workingTeam.json"

const props = defineProps({
  fileUrl:{
    type:Object,
    default:null,
  },
  autoRun:{
    type:Boolean,
    default:false
  }
})

const lottieRef = ref(null)
const runAnimation = ()=>{
    if(lottieRef.value){
      lottie.loadAnimation({
        container: lottieRef.value,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: props.fileUrl,
      });
    }
}

onMounted(()=>{
  if(props.autoRun){
    runAnimation()
  }

})

defineExpose({runAnimation})
</script>

<template>
  <div class="w-full max-w-[900px] overflow-hidden" id="lottieRef" ref="lottieRef"></div>
</template>

