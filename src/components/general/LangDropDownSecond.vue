<script>
  import { h, computed } from 'vue'
  import { NAvatar } from 'naive-ui'
  import uzFlag from '@/assets/images/content/uz.png'
  import ruFlag from '@/assets/images/content/ru.png'
  import enFlag from '@/assets/images/content/en.png'
  import i18n from '@/i18n/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const { t } = i18n.global

  const FLAGS = { uz: uzFlag, ru: ruFlag, en: enFlag, uz_kr: uzFlag }

  const renderFlagIcon = (src) => () =>
    h(NAvatar, { round: true, class: 'w-[18px]! h-[18px]!', src })

  export function useLangMenu() {
    const currentLang = computed(() => localStorage.getItem(useAppSetting.languageKey) || 'uz')

    const langMenuItem = computed(() => ({
      label: t('content.language'),
      key: 'lang-parent',
      icon: renderFlagIcon(FLAGS[currentLang.value]),
      children: [
        { label: t('content.langUz'), key: 'lang:uz', icon: renderFlagIcon(uzFlag) },
        { label: t('content.langRu'), key: 'lang:ru', icon: renderFlagIcon(ruFlag) },
        { label: t('content.langEn'), key: 'lang:en', icon: renderFlagIcon(enFlag) },
        { label: t('content.langUzKr'), key: 'lang:uz_kr', icon: renderFlagIcon(uzFlag) }
      ]
    }))

    const selectLang = (key) => {
      if (!key.startsWith('lang:')) return false
      localStorage.setItem(useAppSetting.languageKey, key.split(':')[1])
      window.location.reload()
      return true
    }

    return { langMenuItem, selectLang }
  }
</script>
