<script setup>
import Utils from "@/utils/Utils.js"

const showDate = ref(true)
defineProps({
  date:{
    type:Date,
    default:null
  }
})

const handleMouse = (v)=>{
  showDate.value = v
}

</script>

<template>
    <div
        class="cursor-pointer px-2 overflow-hidden relative h-[24px]"
        @mouseenter="handleMouse(false)"
        @mouseleave="handleMouse(true)"
    >
      <Transition name="fade">
      <div class="absolute left-[50%] translate-x-[-50%]" v-if="showDate">{{Utils.timeOnlyDate(date)}}</div>
      <div class="absolute left-[50%] translate-x-[-50%] text-danger" v-else>{{Utils.timeOnlyHour(date)}}</div>
      </Transition>
    </div>


</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease-in-out;

}

.fade-enter-from{
  opacity: 0;
  transform: translateY(-30px)
}
.fade-leave-to{
  opacity: 0;
  transform: translateY(30px)
}
</style>