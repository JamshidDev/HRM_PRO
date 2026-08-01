<script setup>
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import {
    Password20Regular,
    DocumentEdit20Regular,
    Person20Regular,
    Send20Regular,
    Alert20Regular
  } from '@vicons/fluent'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import i18n from '@/i18n/index.js'

  import OrgForm from './OrgForm.vue'
  import SocialLink from './SocialLink.vue'
  import PasswordForm from './PasswordForm.vue'
  import Notifications from './Notifications.vue'

  const { t } = i18n.global
  const store = useAccountStore()

  const tabList = computed(() => [
    { id: store.tabs[0], name: t('profilePage.tabs.profileInfo'), icon: Person20Regular },
    { id: store.tabs[4], name: t('profilePage.tabs.social.title'), icon: Send20Regular },
    { id: store.tabs[1], name: t('profilePage.tabs.notification'), icon: Alert20Regular }
  ])
</script>

<template>
  <div class="w-full flex items-start gap-4">
    <div class="w-[280px] shrink-0 bg-surface-section rounded-3xl p-1">
      <div class="bg-primary/10 text-primary text-base font-semibold rounded-2xl px-4 py-3 mb-2">
        {{ $t('profilePage.sidebar.title') }}
      </div>
      <div
        v-for="item in tabList"
        :key="item.id"
        class="flex items-center gap-3 px-2 py-2 mb-1 rounded-xl cursor-pointer transition-colors"
        :class="
          store.activeTab === item.id
            ? 'bg-primary text-white font-semibold'
            : 'text-textColor2 hover:bg-surface-ground'
        "
        @click="store.activeTab = item.id"
      >
        <span
          class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
          :class="store.activeTab === item.id ? 'bg-white/20' : ''"
        >
          <n-icon size="16" :color="store.activeTab === item.id ? '#ffffff' : undefined">
            <component :is="item.icon" />
          </n-icon>
        </span>
        <span class="text-sm truncate">{{ item.name }}</span>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <Transition name="tab-fade" mode="out-in">
        <div :key="store.activeTab">
          <div v-if="store.activeTab === store.tabs[0]">
            <SectionHeader
              v-if="store.checkPermission(store.pn.hrCommandsBlank)"
              :title="$t('profilePage.org.title')"
              :icon="DocumentEdit20Regular"
              plain
              large
              class="mb-4"
            >
              <OrgForm />
            </SectionHeader>

            <SectionHeader
              :title="
                store.mustChangePassword
                  ? $t('passwordForm.mustChangeTitle')
                  : $t('passwordForm.changeTitle')
              "
              :icon="Password20Regular"
              plain
              large
            >
              <template v-if="store.mustChangePassword" #title-suffix>
                <n-tag type="warning" size="small" round>{{ $t('passwordForm.required') }}</n-tag>
              </template>
              <PasswordForm />
            </SectionHeader>
          </div>

          <SocialLink v-else-if="store.activeTab === store.tabs[4]" />

          <Notifications v-else-if="store.activeTab === store.tabs[1]" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
  .tab-fade-enter-active,
  .tab-fade-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }
  .tab-fade-enter-from,
  .tab-fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
  }
</style>
