<script setup>
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import i18n from '@/i18n/index.js'
  import UserIcon from '@/assets/icons/user.svg'
  import OrdersIcon from '@/assets/icons/Orders.svg'
  import TelegramIcon from '@/assets/icons/telegram.svg'
  import RingIcon from '@/assets/icons/ring.svg'
  import FileEditIcon from '@/assets/icons/fileEdit.svg'
  import LockIcon from '@/assets/icons/lock.svg'

  import AccountInfo from './AccountInfo.vue'
  import OrgForm from './OrgForm.vue'
  import SocialLink from './SocialLink.vue'
  import PasswordForm from './PasswordForm.vue'
  import Notifications from './Notifications.vue'
  import MySalary from './MySalary.vue'

  const { t } = i18n.global
  const store = useAccountStore()

  // Buyruq blankasi ma'lumotlari alohida tab — u faqat tegishli ruxsat bo'lganda
  // ko'rinadi (ilgari "Hisob ma'lumotlar" tabining ichida shu shart bilan turardi).
  const canEditCommandBlank = computed(() =>
    store.checkPermission(store.pn.hrCommandsBlank)
  )

  const tabList = computed(() =>
    [
      { id: store.tabs[0], name: t('profilePage.tabs.profileInfo'), icon: UserIcon },
      canEditCommandBlank.value
        ? { id: store.tabs[2], name: t('profilePage.tabs.command'), icon: OrdersIcon }
        : null,
      { id: store.tabs[4], name: t('profilePage.tabs.social.title'), icon: TelegramIcon },
      { id: store.tabs[1], name: t('profilePage.tabs.notification'), icon: RingIcon },
      { id: store.tabs[3], name: t('salary1c.mySalary'), icon: FileEditIcon }
    ].filter(Boolean)
  )
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
            <AccountInfo class="mb-4" />

            <SectionHeader
              :title="
                store.mustChangePassword
                  ? $t('passwordForm.mustChangeTitle')
                  : $t('passwordForm.changeTitle')
              "
              :icon="LockIcon"
              large
            >
              <template v-if="store.mustChangePassword" #title-suffix>
                <n-tag type="warning" size="small" round>{{ $t('passwordForm.required') }}</n-tag>
              </template>
              <PasswordForm />
            </SectionHeader>
          </div>

          <SectionHeader
            v-else-if="store.activeTab === store.tabs[2] && canEditCommandBlank"
            :title="$t('profilePage.org.title')"
            :icon="FileEditIcon"
            large
          >
            <OrgForm />
          </SectionHeader>

          <SocialLink v-else-if="store.activeTab === store.tabs[4]" />

          <Notifications v-else-if="store.activeTab === store.tabs[1]" />

          <MySalary v-else-if="store.activeTab === store.tabs[3]" />
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
