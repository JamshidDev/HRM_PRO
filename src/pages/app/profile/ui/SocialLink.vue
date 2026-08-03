<script setup>
  import { ArrowUpRight16Regular, Copy16Regular } from '@vicons/fluent'
  import { useMessage } from 'naive-ui'
  import i18n from '@/i18n/index.js'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import GroupIllustration from '@/assets/images/content/social-group.png'
  import BotIllustration from '@/assets/images/content/social-bot.png'
  import UserPlusIcon from '@/assets/icons/userPlus.svg'

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
  <SectionHeader :title="$t('profilePage.tabs.social.title')" :icon="UserPlusIcon" plain large>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="relative overflow-hidden rounded-2xl bg-surface-ground p-5 min-h-[190px]">
        <img
          :src="GroupIllustration"
          alt=""
          class="pointer-events-none select-none absolute right-2 bottom-2 w-36 h-36 object-contain"
        />
        <div class="relative z-10 flex items-start justify-between gap-2">
          <h3 class="text-lg font-semibold text-textColor0">{{ $t(props.links[0].name) }}</h3>
          <div
            @click="copyToClipboard(props.links[0].url)"
            class="flex items-center gap-1 text-sm text-primary cursor-pointer shrink-0"
          >
            <n-icon size="16">
              <Copy16Regular />
            </n-icon>
            {{ $t('profilePage.tabs.social.copy') }}
          </div>
        </div>
        <div class="relative z-10 mt-8">
          <n-button type="primary" size="large" class="!rounded-lg" @click="openLink(props.links[0].url)">
            <span class="flex items-center gap-2">
              {{ $t('profilePage.tabs.social.join') }}
              <n-icon size="18">
                <ArrowUpRight16Regular />
              </n-icon>
            </span>
          </n-button>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl bg-surface-ground p-5 min-h-[190px]">
        <img
          :src="BotIllustration"
          alt=""
          class="pointer-events-none select-none absolute right-2 bottom-2 w-36 h-36 object-contain"
        />
        <div class="relative z-10 flex items-start justify-between gap-2">
          <h3 class="text-lg font-semibold text-textColor0">{{ $t(props.links[1].name) }}</h3>
          <div
            @click="copyToClipboard(props.links[1].url)"
            class="flex items-center gap-1 text-sm text-primary cursor-pointer shrink-0"
          >
            <n-icon size="16">
              <Copy16Regular />
            </n-icon>
            {{ $t('profilePage.tabs.social.copy') }}
          </div>
        </div>
        <div class="relative z-10 mt-8">
          <n-button type="primary" size="large" class="!rounded-lg" @click="openLink(props.links[1].url)">
            <span class="flex items-center gap-2">
              {{ $t('profilePage.tabs.social.join') }}
              <n-icon size="18">
                <ArrowUpRight16Regular />
              </n-icon>
            </span>
          </n-button>
        </div>
      </div>
    </div>
  </SectionHeader>
</template>
