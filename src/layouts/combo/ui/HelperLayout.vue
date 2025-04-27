<script setup>
import OrganizationModal from "@/pages/app/profile/ui/OrganizationModal.vue"
import TelegramPopup from "@/pages/app/popups/Telegram.vue"
onMounted(()=>{
  console.log("Helpers mounted")
})
</script>

<template>
  <div>
    <OrganizationModal/>
    <TelegramPopup/>
  </div>
</template>
