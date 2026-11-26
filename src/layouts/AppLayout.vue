<script setup>
  import { useRoute } from 'vue-router'
  import { AppLayouts, AppPaths } from '@/utils/index.js'
  import Combo from './combo/Combo.vue'
  import Empty from './empty/Empty.vue'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { navigations, otherNavigations } from '@/layouts/data/navigations.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const route = useRoute()
  const store = useAccountStore()
  const isLoadApp = ref(false)

  const layout = computed(() => {
    switch (route?.meta?.layout) {
      case AppLayouts.main:
        return Combo
      default:
        return Empty
    }
  })

  watchEffect(() => {
    // Guruh ichidagi sahifalar ham sarlavha olsin (ichma-ich children).
    const flat = (items) => items.flatMap((v) => [v, ...flat(v.children ?? [])])
    const list = flat(navigations.flatMap((v) => v.children ?? []))
    const currentItem = [...list, ...otherNavigations].filter((v) => v.path === route.path)
    // Login sahifasi Google'da ko'rinadi — «Xush kelibsiz» emas, kalit so'zli sarlavha.
    if (route.path === AppPaths.Login) {
      window.document.title = t('seo.loginTitle')
    } else if (currentItem.length > 0) {
      window.document.title = 'HRM PRO | ' + t(currentItem[0].label)
    }
  })

  watch(route, (value) => {
    if (value.meta.layout !== AppLayouts.empty && isLoadApp.value) {
      isLoadApp.value = false
      store._index()
    }
  })

  onMounted(() => {
    isLoadApp.value = true
  })
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
