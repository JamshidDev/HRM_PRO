<script setup>
import { h, computed } from 'vue'
import { NIcon } from 'naive-ui'
import { useRouter } from 'vue-router'
import icons from '@assets/icons'
import { useAppStore, useAccountStore, useSocketStore } from '@/store/modules/index.js'
import i18n from '@/i18n/index.js'
import { AppPaths, useAppSetting } from '@/utils/index.js'
import { useThemeMenu } from '@/components/general/ThemeDropDown.vue'
import { useLangMenu } from '@/components/general/LangDropDownSecond.vue'

const { t } = i18n.global
const router = useRouter()
const store = useAppStore()
const accountStore = useAccountStore()
const socketStore = useSocketStore()

const { themeMenuItem, selectTheme } = useThemeMenu()
const { langMenuItem, selectLang } = useLangMenu()

const renderIcon = (icon) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon, { class: 'text-xl' })
    })
  }
}

const options = computed(() => {
  const opts = [
    themeMenuItem.value,
    langMenuItem.value,
    { label: t('content.profile'), key: 'profile', icon: renderIcon(icons.userIcon) },
    {
      label: t('content.changeAccount'),
      key: 'changeAccount',
      icon: renderIcon(icons.usersIcon)
    },
    { label: t('content.setting'), key: 'setting', icon: renderIcon(icons.settingsIcon) },
    { label: t('content.logOutSystem'), key: 'logout', icon: renderIcon(icons.logoutSystemIcon) }
  ]

  return opts
})

const changeOption = (v) => {
  if (v === 'profile') {
    router.push(AppPaths.Profile)
  } else if (v === 'logout') {
    onLogOutEv()
  } else if (v === 'changeAccount') {
    accountStore.openRoleModal()
  } else if (v === 'setting') {
    store.openProfileSettings()
  } else {
    selectTheme(v) || selectLang(v)
  }
}

const onLogOutEv = () => {
  accountStore._logOut(() => {
    socketStore.disconnect()
    store._logOutApp()
  })
}
</script>

<template>
  <n-dropdown :options="options" trigger="click" @select="changeOption">
    <div class="flex items-center gap-2">
      <!-- Aylanuvchi gradient halqa + yumshoq nur -->
      <div class="profile-ring cursor-pointer shrink-0">
        <div class="profile-ring__gap">
          <n-avatar
            round
            :size="36"
            object-fit="cover"
            :src="accountStore.account?.worker?.photo || useAppSetting.noAvailableImage"
            :fallback-src="useAppSetting.noAvailableImage"
          />
        </div>
      </div>
    </div>
  </n-dropdown>
</template>

<style scoped>
/* Portret (ID) rasmlarda bosh kesilmasligi uchun kesishni pastdan qilamiz */
:deep(.n-avatar img) {
  object-position: top;
}

.profile-ring {
  position: relative;
  width: 44px;
  height: 44px;
  padding: 2px;
  border-radius: 50%;
  isolation: isolate;
  transition: transform 0.3s ease;
}

/* Halqa va uning nuri bir xil gradientdan; nur xiraroq va xira (blur). */
.profile-ring::before,
.profile-ring::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #22d3ee, #3b82f6);
  animation: profile-ring-spin 6s linear infinite;
  z-index: -1;
}

.profile-ring::after {
  inset: -2px;
  filter: blur(8px);
  opacity: 0.35;
  transition: opacity 0.3s ease;
  z-index: -2;
}

.profile-ring__gap {
  width: 100%;
  height: 100%;
  padding: 2px;
  border-radius: 50%;
  background: #0b1220;
}

.profile-ring__gap :deep(.n-avatar) {
  display: block;
}

.profile-ring:hover {
  transform: scale(1.05);
}

.profile-ring:hover::before,
.profile-ring:hover::after {
  animation-duration: 2.5s;
}

.profile-ring:hover::after {
  opacity: 0.7;
}

:root[data-theme='dark'] .profile-ring__gap {
  background: #050506;
}

@keyframes profile-ring-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-ring::before,
  .profile-ring::after {
    animation: none;
  }
}
</style>
