<script setup>
  import OrganizationModal from '@/pages/app/profile/ui/OrganizationModal.vue'
  import TelegramPopup from '@/pages/app/popups/Telegram.vue'
  import ProfileSettingsModal from '@/components/ProfileSettingsModal.vue'
  import { UIImageViewer } from '@/components/index.js'
</script>

<template>
  <UIImageViewer />
  <OrganizationModal />
  <TelegramPopup />
  <ProfileSettingsModal />
</template>
