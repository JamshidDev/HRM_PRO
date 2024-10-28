<script setup>
import Utils from "@/utils/Utils.js";
import {Camera24Filled} from "@vicons/fluent"
</script>

<template>
  <div class="w-[180px] h-[180px]
  select-none
   rounded-full bg-gradient-to-t
   from-blue-400
   to-80% cursor-pointer
   to-primary
   absolute left-10 bottom-[-90px] z-10 flex justify-center items-center">
    <img
        class="w-[170px] rounded-full"
        :src="Utils.noAvailableImage"
        alt="">

    <div class="w-[36px] h-[36px] bg-blue-400 absolute rounded-full bottom-4 right-1 flex justify-center items-center">

      <n-icon class="text-white text-2xl cursor-pointer">
        <Camera24Filled/>
      </n-icon>
    </div>
  </div>

</template>
