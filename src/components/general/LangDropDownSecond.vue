<script setup>
  import { NAvatar } from 'naive-ui'
  import uzFlag from '@/assets/images/content/uz.png'
  import ruFlag from '@/assets/images/content/ru.png'
  import enFlag from '@/assets/images/content/en.png'
  import i18n from '@/i18n/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const { t } = i18n.global

  const FLAGS = { uz: uzFlag, ru: ruFlag, en: enFlag, uz_kr: uzFlag }

  const currentLang = computed({
    get: () => localStorage.getItem(useAppSetting.languageKey) || 'uz',
    set: (val) => {
      localStorage.setItem(useAppSetting.languageKey, val)
      window.location.reload()
    }
  })

  const avatarIcon = (flag) => () => h(NAvatar, { round: true, class: 'w-[20px]! h-[20px]!', src: flag })

  const langOptions = computed(() => [
    { label: t('content.langUz'), value: 'uz', icon: avatarIcon(FLAGS.uz) },
    { label: t('content.langRu'), value: 'ru', icon: avatarIcon(FLAGS.ru) },
    { label: t('content.langEn'), value: 'en', icon: avatarIcon(FLAGS.en) },
    { label: t('content.langUzKr'), value: 'uz_kr', icon: avatarIcon(FLAGS.uz_kr) }
  ])

  const renderLabel = (option) => {
    return h('div', { class: 'flex items-center gap-2' }, [
      h(option.icon),
      h('span', null, option.label)
    ])
  }
</script>

<template>
  <n-select
    v-model:value="currentLang"
    :options="langOptions"
    :render-label="renderLabel"
    class="w-full"
  />
</template>