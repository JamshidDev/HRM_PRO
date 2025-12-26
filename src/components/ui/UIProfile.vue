<script setup>
  import { h } from 'vue'
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

  const options = ref([
    {
      label: t('content.profile'),
      key: 'profile',
      icon: renderIcon(Person24Regular)
    },
    {
      label: t('content.changeAccount'),
      key: 'changeAccount',
      icon: renderIcon(PeopleSync20Regular)
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
      socketStore.disconnect()
      store._logOutApp()
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
</script>

<template>
  <n-dropdown :options="options" trigger="click" @select="changeOption">
    <div class="flex items-center gap-2">
      <div class="hidden md:block">
        <div class="font-medium text-xs max-w-[200px] truncate text-textColor0">
          {{ accountStore.account?.organization?.name }}
        </div>
        <div class="text-xs text-textColor1">
          {{
            accountStore.account?.worker?.last_name +
            '.' +
            accountStore.account?.worker?.first_name?.[0]
          }}
        </div>
      </div>
      <n-avatar
        class="cursor-pointer"
        round
        size="large"
        :src="accountStore.account?.worker?.photo || useAppSetting.noAvailableImage"
        :fallback-src="useAppSetting.noAvailableImage"
      />
    </div>
  </n-dropdown>
</template>

<style scoped></style>
