<script setup>
  import { UISegmentTabs } from '@/components/index.js'
  import GlobeIcon from '@/assets/icons/tsDoorOpen.svg'
  import i18n from '@/i18n/index.js'
  import LoginMethods from './LoginMethods.vue'
  import TelegramLinkCard from './TelegramLinkCard.vue'
  import DeviceSessionsCard from './DeviceSessionsCard.vue'
  import SsoLogins from './SsoLogins.vue'

  const { t } = i18n.global

  // Xavfsizlik: kirish usullari (kartalar) va kirishlar tarixi — bitta sahifada ikki tab.
  const active = ref('methods')
  const tabs = computed(() => [
    { id: 'methods', name: t('securityPage.tabs.methods') },
    { id: 'history', name: t('securityPage.tabs.history') }
  ])
</script>

<template>
  <div>
    <UISegmentTabs v-model="active" :tabs="tabs" variant="elevated" class="mb-4" />

    <div v-if="active === 'methods'" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <LoginMethods />
      <TelegramLinkCard />
      <DeviceSessionsCard />
      <LoginMethods
        :keys="['sso']"
        title-key="loginMethods.otherSystems.title"
        description-key="loginMethods.otherSystems.description"
        :icon="GlobeIcon"
      />
    </div>

    <SsoLogins v-else />
  </div>
</template>
