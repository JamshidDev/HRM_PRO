<template>
  <a
    :href="targetUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="old-version-btn flex items-center gap-1.5 h-9 px-4 bg-success rounded-full cursor-pointer fixed top-0 left-1/2 -translate-x-1/2 shadow-md"
    :class="isSidebarOpen ? 'z-[90]' : 'z-[200]'"
  >
    <span class="text-white text-sm font-medium whitespace-nowrap">{{ $t(labelKey) }}</span>
    <RevertIcon class="text-white w-4 h-4" :class="{ '[transform:rotateY(180deg)]': mode === 'old' }" />
  </a>
</template>

<script setup>
  import { computed } from 'vue'
  import RevertIcon from '@/assets/icons/revertIcon.svg'

  const OLD_SITE_URL = 'https://hrm.railway.uz/old/'

  const props = defineProps({
    mode: {
      type: String,
      default: 'old',
      validator: (value) => ['old', 'new'].includes(value)
    },
    href: {
      type: String,
      default: ''
    },
    isSidebarOpen: {
      type: Boolean,
      default: false
    }
  })

  const targetUrl = computed(
    () => props.href || (props.mode === 'old' ? OLD_SITE_URL : import.meta.env.VITE_NEW_SITE_URL)
  )

  const labelKey = computed(() => (props.mode === 'old' ? 'content.oldVersionButton' : 'content.newVersionButton'))
</script>

<style scoped>
  .old-version-btn {
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .old-version-btn:hover {
    transform: scale(1.03);
  }
</style>
