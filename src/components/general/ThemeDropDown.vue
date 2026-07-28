<script setup>
  import { computed, h } from 'vue'
  import { NIcon } from 'naive-ui'
  import { WeatherSunny32Filled, WeatherMoon28Filled, Desktop24Regular } from '@vicons/fluent'
  import { useAppStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAppStore()

  const renderIcon = (icon, color) => () =>
    h(NIcon, { color }, { default: () => h(icon, { class: 'text-lg' }) })

  const themeOptions = computed(() => [
    {
      label: t('content.themeLight'),
      value: 'light',
      icon: renderIcon(WeatherSunny32Filled, '#eab308')
    },
    {
      label: t('content.themeDark'),
      value: 'dark',
      icon: renderIcon(WeatherMoon28Filled, '#818cf8')
    },
    {
      label: t('content.themeSystem'),
      value: 'system',
      icon: renderIcon(Desktop24Regular, '#9ca3af')
    }
  ])

  const selectedTheme = computed({
    get: () => store.themeMode,
    set: (val) => store.setThemeMode(val)
  })

  const renderLabel = (option) => {
    return h('div', { class: 'flex items-center gap-2' }, [
      h(option.icon),
      h('span', null, option.label)
    ])
  }
</script>

<template>
  <n-select
    v-model:value="selectedTheme"
    :options="themeOptions"
    :render-label="renderLabel"
    class="w-full"
  />
</template>