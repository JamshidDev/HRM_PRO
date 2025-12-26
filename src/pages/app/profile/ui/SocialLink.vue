<script setup>
  import { ArrowRight24Regular, Copy24Regular } from '@vicons/fluent'
  import { useMessage } from 'naive-ui'
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global
  const message = useMessage()

  const props = defineProps({
    links: {
      type: Array,
      default: () => [
        {
          id: 1,
          name: 'profilePage.tabs.social.group',
          url: 'https://t.me/+2-gaFqZ9NMkxNDhi'
        },
        {
          id: 2,
          name: 'profilePage.tabs.social.bot',
          url: 'https://t.me/hrmpro_robot'
        }
      ]
    }
  })

  const copyToClipboard = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        $Toast.success(t('profilePage.tabs.social.copySuccess'))
      })
      .catch(() => {
        $Toast.error(t('profilePage.tabs.social.copyError'))
      })
  }

  const openLink = (url) => {
    window.open(url, '_blank')
  }
</script>

<template>
  <div class="bg-surface-ground p-4 rounded-lg min-h-full">
    <div class="grid grid-cols-12 gap-x-4">
      <div class="col-span-12 mb-16">
        <h3 class="text-2xl font-bold text-textColor dark:text-white">
          {{ $t('profilePage.tabs.social.title') }}
        </h3>
        <p class="text-secondary">
          {{ $t('profilePage.tabs.social.subtitle') }}
        </p>
      </div>
      <div class="col-span-12 md:col-span-6">
        <div
          class="w-full shadow-sm border border-surface-line rounded-2xl bg-gradient-to-b from-primary/80 to-primary p-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
        >
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-10">
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"
            ></div>
            <div
              class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12 group-hover:scale-125 transition-transform duration-700"
            ></div>
          </div>

          <!-- Content -->
          <div class="relative z-10">
            <h2 class="text-center text-xl md:text-2xl font-semibold text-surface-section">
              {{ $t(props.links[0].name) }}
            </h2>
            <div class="flex flex-col sm:flex-row justify-between gap-2 mt-6">
              <div
                @click="copyToClipboard(props.links[0].url)"
                class="text-xs cursor-pointer border border-surface-section h-[32px] rounded-2xl flex items-center justify-center px-2 text-surface-section hover:bg-surface-section/20 transition-colors"
              >
                {{ $t('profilePage.tabs.social.copy') }}
                <n-icon size="16" class="ml-2">
                  <Copy24Regular />
                </n-icon>
              </div>
              <div
                @click="openLink(props.links[0].url)"
                class="text-xs cursor-pointer border border-surface-section h-[32px] rounded-2xl flex items-center justify-center px-2 text-surface-section hover:bg-surface-section/20 transition-colors"
              >
                {{ $t('profilePage.tabs.social.join') }}
                <n-icon size="16" class="ml-2">
                  <ArrowRight24Regular />
                </n-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-12 md:col-span-6">
        <div
          class="w-full shadow-sm border border-surface-line rounded-2xl bg-gradient-to-b from-warning/80 to-warning p-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
        >
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-10">
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"
            ></div>
            <div
              class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12 group-hover:scale-125 transition-transform duration-700"
            ></div>
          </div>

          <!-- Content -->
          <div class="relative z-10">
            <h2 class="text-center text-xl md:text-2xl font-semibold text-surface-section">
              {{ $t(props.links[1].name) }}
            </h2>
            <div class="flex flex-col sm:flex-row justify-between gap-2 mt-6">
              <div
                @click="copyToClipboard(props.links[1].url)"
                class="text-xs cursor-pointer border border-surface-section h-[32px] rounded-2xl flex items-center justify-center px-2 text-surface-section hover:bg-surface-section/20 transition-colors"
              >
                {{ $t('profilePage.tabs.social.copy') }}
                <n-icon size="16" class="ml-2">
                  <Copy24Regular />
                </n-icon>
              </div>
              <div
                @click="openLink(props.links[1].url)"
                class="text-xs cursor-pointer border border-surface-section h-[32px] rounded-2xl flex items-center justify-center px-2 text-surface-section hover:bg-surface-section/20 transition-colors"
              >
                {{ $t('profilePage.tabs.social.join') }}
                <n-icon size="16" class="ml-2">
                  <ArrowRight24Regular />
                </n-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
