<script setup>
import Utils from "@/utils/Utils.js";
import {Camera24Filled} from "@vicons/fluent"
import {UICropper} from "@/components/index.js";
import {useAccountStore} from "@/store/modules/index.js";
const store = useAccountStore()

const cropperRef = ref(null)

const openCropper = ()=>{
  cropperRef.value.openFile()
}

const onResult = (v)=>{
  store.accountImage = v.imgUrl
  store._updateAvatar()
}
</script>

<template>
  <div class="w-[120px] h-[160px]
  select-none
   rounded-xl bg-gradient-to-t
   from-blue-100
   to-80% cursor-pointer
   to-primary top-1/2 -translate-y-1/2
   absolute left-4 z-10 flex justify-center items-center">
    <img
        class="rounded-xl w-[110px] h-[150px]"
        :src="store.account? store.account?.photo : Utils.noAvailableImage"
        :alt="store.account?.first_name">

    <div @click="openCropper()" class="w-[36px] h-[36px] bg-blue-400 absolute rounded-full bottom-1 -right-4 flex justify-center items-center shadow">

      <n-icon class="text-white text-2xl cursor-pointer">
        <Camera24Filled/>
      </n-icon>
    </div>
  </div>
  <UICropper ref="cropperRef" @on-result="onResult" />

</template>
