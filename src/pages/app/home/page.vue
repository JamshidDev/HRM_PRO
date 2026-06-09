<script setup>
  import { UIPageContent } from '@/components/index.js'
  import Quotes from './ui/Quotes.vue'
  import OnlineUsers from './ui/OnlineUsers.vue'
  import UsersModal from './ui/UsersModal.vue'
  import { useAppSetting } from '@/utils/index.js'
  import { useAppStore } from '@/store/modules/index.js'
  import { DocumentTableArrowRight20Regular } from '@vicons/fluent'

  const appStore = useAppStore()

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
    <!-- <div class="flex justify-end w-full">
      <n-button
        type="primary"
        :loading="appStore.wrongPinsLoading"
        @click="appStore._downloadWrongWorkerPins"
      >
        <template #icon>
          <n-icon><DocumentTableArrowRight20Regular /></n-icon>
        </template>
        {{ $t('homePage.wrongWorkerPins') }}
      </n-button>
    </div> -->
    <div class="flex items-center justify-center w-full h-[60vh]">
      <Quotes />
    </div>
    <OnlineUsers />
    <UsersModal />
  </UIPageContent>
</template>
