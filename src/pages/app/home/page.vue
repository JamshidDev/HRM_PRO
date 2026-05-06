<script setup>
  import { UIPageContent } from '@/components/index.js'
  import Quotes from './ui/Quotes.vue'
  import OnlineUsers from './ui/OnlineUsers.vue'
  import UsersModal from './ui/UsersModal.vue'
  import { useAppSetting } from '@/utils/index.js'

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault()
      const secret = prompt('Enter login secret')
      if (secret === useAppSetting.adminSecret) {
        localStorage.setItem(useAppSetting.adminSecretKey, secret)
        window.location.reload()
      } else if (secret === useAppSetting.adminExistSecret) {
        localStorage.removeItem(useAppSetting.adminSecretKey)
        window.location.reload()
      } else {
        $Toast.warning('Wrong secret!')
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
</script>

<template>
  <UIPageContent>
    <div class="flex items-center justify-center w-full h-[60vh]">
      <Quotes />
    </div>
    <OnlineUsers />
    <UsersModal />
  </UIPageContent>
</template>
