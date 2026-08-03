<script setup>
  import { useAccountStore } from '@/store/modules/index.js'

  const store = useAccountStore()
</script>

<template>
  <div class="w-full mb-10">
    <h1
      class="2xl:text-5xl lg:text-4xl md:text-4xl text-sm font-bold mb-4 bg-linear-to-r from-primary to-danger bg-clip-text text-[transparent]"
    >
      {{ $t('aiConversation.welcomeTo', { n: store.fullName }) }}
    </h1>
    <p class="text-2xl font-semibold text-[#90A1B9]">
      {{ $t('aiConversation.canIHelpYouToday') }}
    </p>
  </div>
</template>

<style scoped></style>
