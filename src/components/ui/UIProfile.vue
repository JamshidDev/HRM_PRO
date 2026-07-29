<script setup>
  import { h } from 'vue'
  import { NIcon } from 'naive-ui'
  import { useRouter } from 'vue-router'
  import {
    Settings16Regular,
    SignOut20Regular,
    PeopleSync20Regular,
    PeopleLock24Filled,
    WeatherMoon28Filled,
    WeatherSunny32Filled
} from '@vicons/fluent'
  import icons from '@assets/icons'
  import { useAppStore, useAccountStore, useSocketStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { AppPaths, useAppSetting } from '@/utils/index.js'
  import { getActivePinia } from 'pinia'
  import LangDropdown from '@/components/general/LangDropdown.vue'

  const { t } = i18n.global
  const router = useRouter()
  const store = useAppStore()
  const accountStore = useAccountStore()
  const socketStore = useSocketStore()

  const renderIcon = (icon) => {
    return () => {
      return h(NIcon, null, {
        default: () => h(icon, { class: 'text-xl' })
      })
    }
  }

  const themeMenuItem = {
    key: 'themeToggle',
    type: 'render',
    render: () =>
      h(
        'div',
        {
          class:
            'group flex items-center gap-2 hover:bg-surface-200 px-2 py-1.5 m-1 rounded-sm cursor-pointer text-textColor0'
        },
        [
          h(NIcon, { size: 20, class: 'text-textColor0 group-hover:text-[#2E90FA]' }, {
            default: () => h(store.themeSwitch ? WeatherSunny32Filled : WeatherMoon28Filled)
          }),
          h('span', { class: 'text-sm text-textColor0 group-hover:text-[#2E90FA]' }, t('content.theme'))
        ]
      ),
    props: {
      onClick: () => {
        store.themeSwitch = !store.themeSwitch
        store.changeTheme()
      }
    }
  }

  const langMenuItem = {
    key: 'langSwitch',
    type: 'render',
    render: () =>
      h(
        'div',
        {
          class: 'group flex items-center gap-2 hover:bg-surface-200 px-2 py-1.5 m-1 rounded-sm text-textColor0'
        },
        [
          h(LangDropdown, { compact: true }),
          h('span', { class: 'text-sm text-textColor0 group-hover:text-[#2E90FA]' }, t('content.language'))
        ]
      )
  }

  const options = ref([
    themeMenuItem,
    langMenuItem,
    {
      label: t('content.profile'),
      key: 'profile',
      icon: renderIcon(icons.userIcon)
    },
    {
      label: t('content.changeAccount'),
      key: 'changeAccount',
      icon: renderIcon(icons.usersIcon)
    },
    {
      label: t('content.setting'),
      key: 'setting',
      icon: renderIcon(Settings16Regular)
    },
    {
      label: t('content.logOutSystem'),
      key: 'logout',
      icon: renderIcon(SignOut20Regular)
    }
  ])

  const secret = localStorage.getItem(useAppSetting.adminSecretKey)
  if (secret === useAppSetting.adminSecret) {
    options.value.unshift({
      label: t('content.asAdmin'),
      key: 'asAdmin',
      icon: renderIcon(PeopleLock24Filled)
    })
  }

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
