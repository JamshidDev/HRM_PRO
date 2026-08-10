<script setup>
  import { useAccountStore, useAIConversationStore } from '@/store/modules/index.js'
  import robotImage from '@/assets/images/content/robot-image.svg?url'

  defineProps({
    showPanel: {
      type: Boolean,
      default: true
    }
  })

  const accountStore = useAccountStore()
  const store = useAIConversationStore()

  const greetingKey = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'aiConversation.greeting.morning'
    if (hour < 18) return 'aiConversation.greeting.day'
    return 'aiConversation.greeting.evening'
  })
</script>

<template>
  <div v-if="store.messages.length === 0" class="w-full flex flex-col items-center text-center">
    <img
      :src="robotImage"
      alt="imageRobot"
      :class="showPanel ? 'w-56 h-56' : 'w-32 h-32'"
      class="object-contain select-none"
      draggable="false"
    />

    <h1
      :class="showPanel ? 'text-2xl sm:text-4xl text-primary' : 'text-xl sm:text-3xl text-textColor0'"
      class="font-semibold sm:font-bold mb-2"
    >
      {{ $t(greetingKey, { n: accountStore.account?.worker?.first_name }) }}
    </h1>
    <p :class="showPanel ? 'text-lg' : 'text-xl'" class="text-textColor2 mb-8">
      {{ $t('aiConversation.canIHelpYouToday') }}
    </p>
  </div>
</template>
