<script>
  import { h, computed } from 'vue'
  import { NIcon } from 'naive-ui'
  import { WeatherSunny32Filled, WeatherMoon28Filled, Desktop24Regular } from '@vicons/fluent'
  import { useAppStore } from '@/store/modules/index.js'
  import icons from '@assets/icons'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const renderIcon = (icon) => () =>
    h(NIcon, null, { default: () => h(icon, { class: 'text-xl' }) })

  export function useThemeMenu() {
    const store = useAppStore()

    const themeMenuItem = computed(() => ({
      label: t('content.theme'),
      key: 'theme-parent',
      icon: renderIcon(icons.monitorIcon),
      children: [
        {
          label: t('content.themeLight'),
          key: 'theme:light',
          icon: renderIcon(WeatherSunny32Filled)
        },
        {
          label: t('content.themeDark'),
          key: 'theme:dark',
          icon: renderIcon(WeatherMoon28Filled)
        },
        {
          label: t('content.themeSystem'),
          key: 'theme:system',
          icon: renderIcon(Desktop24Regular)
        }
      ]
    }))

    const selectTheme = (key) => {
      if (!key.startsWith('theme:')) return false
      store.setThemeMode(key.split(':')[1])
      return true
    }

    return { themeMenuItem, selectTheme }
  }
</script>
