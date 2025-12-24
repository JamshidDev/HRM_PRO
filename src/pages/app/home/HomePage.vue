<script setup>
import {UIPageContent, AIButton} from "@/components/index.js"
import {useQuoteStore} from "@/store/modules/index.js"
import Quotes from "./ui/Quotes.vue"
import OnlineUsers from "./ui/OnlineUsers.vue"
import UsersModal from "./ui/UsersModal.vue"
const store = useQuoteStore()
import {useAppSetting} from "@/utils/index.js"

const handleKeyDown = (e)=>{
  if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p"){
    e.preventDefault()
    const secret = prompt("Enter login secret")
    if(secret === useAppSetting.adminSecret){
      localStorage.setItem(useAppSetting.adminSecretKey, secret)
      window.location.reload()
    }else if(secret === useAppSetting.adminExistSecret){
      localStorage.removeItem(useAppSetting.adminSecretKey)
      window.location.reload()
    }
    else{
      $Toast.warning("Wrong secret!")
    }
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown)
})

</script>

<template>
    <UIPageContent>
      <div class="w-full h-[60vh] flex justify-center items-center">
          <Quotes/>
      </div>
<!--      <n-button v-fly-upload>Download</n-button>-->
      <OnlineUsers/>
      <UsersModal/>
    </UIPageContent>
</template>

<style scoped>

</style>