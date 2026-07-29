<script setup>
import { h, computed } from 'vue'
import { NIcon } from 'naive-ui'
import { useRouter } from 'vue-router'
import { PeopleLock24Filled } from '@vicons/fluent'
import icons from '@assets/icons'
import { useAppStore, useAccountStore, useSocketStore } from '@/store/modules/index.js'
import i18n from '@/i18n/index.js'
import { AppPaths, useAppSetting } from '@/utils/index.js'
import { getActivePinia } from 'pinia'
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

  const secret = localStorage.getItem(useAppSetting.adminSecretKey)
  if (secret === useAppSetting.adminSecret) {
    opts.unshift({
      label: t('content.asAdmin'),
      key: 'asAdmin',
      icon: renderIcon(PeopleLock24Filled)
    })
  }

  return opts
})

const changeOption = (v) => {
  if (v === 'profile') {
    router.push(AppPaths.Profile)
  } else if (v === 'logout') {
    onLogOutEv()
  } else if (v === 'changeAccount') {
    accountStore.openRoleModal()
  } else if (v === 'asAdmin') {
    const token = sessionStorage.getItem(useAppSetting.temporaryToken)
    if (token) {
      loginAsAdmin(token)
    }
  } else {
    selectTheme(v) || selectLang(v)
  }
}

const loginAsAdmin = (token) => {
  store._loginAsAdmin(token, (tkn) => {
    localStorage.setItem(useAppSetting.tokenKey, tkn)
    accountStore._index(() => {
      getActivePinia().reset()
      router.push(AppPaths.Home)
    })
  })
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
      <n-avatar
        class="cursor-pointer shrink-0"
        round
        size="large"
        object-fit="cover"
        :src="accountStore.account?.worker?.photo || useAppSetting.noAvailableImage"
        :fallback-src="useAppSetting.noAvailableImage"
      />
    </div>
  </n-dropdown>
</template>

<style scoped>
/* Portret (ID) rasmlarda bosh kesilmasligi uchun kesishni pastdan qilamiz */
:deep(.n-avatar img) {
  object-position: top;
}
</style>
