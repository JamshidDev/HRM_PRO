<script setup>
  import { h, computed } from 'vue'
  import { NIcon } from 'naive-ui'
  import { useRouter } from 'vue-router'
  import {
    Person24Regular,
    Settings16Regular,
    SignOut20Regular,
    PeopleSync20Regular,
    PeopleLock24Filled
  } from '@vicons/fluent'
  import { useAppStore, useAccountStore, useSocketStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { AppPaths, useAppSetting } from '@/utils/index.js'
  import { getActivePinia } from 'pinia'
  import LangDropDownSecond from '../general/LangDropDownSecond.vue'
  import ThemeDropDown from '../general/ThemeDropDown.vue'

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
    key: 'themeSwitch',
    type: 'render',
    render: () =>
      h(
        'div',
        {
          class:
            'flex items-center gap-2 hover:bg-surface-200 px-2 py-1.5 m-1  rounded-sm text-textColor0'
        },
        [h(ThemeDropDown)]
      )
  }

  const langMenuItem = {
    key: 'langSwitch',
    type: 'render',
    render: () =>
      h(
        'div',
        {
          class:
            'flex items-center gap-2 hover:bg-surface-200 px-2 py-1.5 m-1 rounded-sm text-textColor0'
        },
        [h(LangDropDownSecond)]
      )
  }

  const options = (() => {
    const opts = [
      { label: t('content.profile'), key: 'profile', icon: renderIcon(Person24Regular) },
      {
        label: t('content.changeAccount'),
        key: 'changeAccount',
        icon: renderIcon(PeopleSync20Regular)
      },
      { label: t('content.setting'), key: 'setting', icon: renderIcon(Settings16Regular) },
      { label: t('content.logOutSystem'), key: 'logout', icon: renderIcon(SignOut20Regular) },

      themeMenuItem,

      langMenuItem
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
  })()

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
