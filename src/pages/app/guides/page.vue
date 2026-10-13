<script setup>
  /**
   * «Qo'llanma» — web va mobil ilova bo'yicha video qo'llanmalar (grid, kategoriya, qidiruv, pleer).
   */
  import { UIPageContent, UISegmentTabs } from '@/components/index.js'
  import { Search20Regular } from '@vicons/fluent'
  import GuideCard from './ui/GuideCard.vue'
  import GuidePlayer from './ui/GuidePlayer.vue'
  import { GUIDE_CATEGORIES } from './categories.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const platform = ref('web')
  const category = ref(null)
  const search = ref('')
  const loading = ref(false)
  const guides = ref([])
  const active = ref(null)

  const platformTabs = computed(() => [
    { id: 'web', name: t('guidesPage.platform.web') },
    { id: 'mobile', name: t('guidesPage.platform.mobile') }
  ])

  // Faqat videosi bor kategoriyalar chip sifatida chiqadi.
  const categories = computed(() => GUIDE_CATEGORIES.filter((c) => guides.value.some((g) => g.category === c)))
  const shown = computed(() => {
    const q = search.value.trim().toLowerCase()
    return guides.value.filter((g) => (!category.value || g.category === category.value) && (!q || g.title?.toLowerCase().includes(q)))
  })

  const load = () => {
    loading.value = true
    $ApiService.videoGuideService
      ._index({ params: { platform: platform.value } })
      .then((res) => {
        guides.value = res.data.data || []
        if (category.value && !categories.value.includes(category.value)) category.value = null
      })
      .finally(() => (loading.value = false))
  }

  const open = (g) => {
    $ApiService.videoGuideService._show({ id: g.id }).then((res) => {
      active.value = res.data.data
      if (!g.is_viewed) {
        $ApiService.videoGuideService._view({ id: g.id }).then(() => {
          g.is_viewed = true
          g.is_new = false
        })
      }
    })
  }

  watch(platform, load)
  onMounted(load)
</script>

<template>
  <UIPageContent class="!h-auto !gap-5">
    <div class="flex w-full flex-wrap items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[24px] leading-[30px] font-semibold text-fig-text-primary">{{ $t('guidesPage.title') }}</h1>
        <p class="text-[14px] text-fig-text-secondary">{{ $t('guidesPage.subtitle') }}</p>
      </div>
      <UISegmentTabs v-model="platform" :tabs="platformTabs" />
    </div>

    <div class="flex w-full flex-wrap items-center gap-2">
      <n-input v-model:value="search" :placeholder="$t('guidesPage.search')" clearable class="!w-full sm:!w-72">
        <template #prefix><n-icon><Search20Regular /></n-icon></template>
      </n-input>
      <button
        type="button"
        class="rounded-full px-3 py-1.5 text-[13px] font-semibold transition"
        :class="!category ? 'bg-primary text-white' : 'bg-fig-block text-fig-text-secondary hover:text-fig-text-primary'"
        @click="category = null"
      >
        {{ $t('guidesPage.all') }}
      </button>
      <button
        v-for="c in categories"
        :key="c"
        type="button"
        class="rounded-full px-3 py-1.5 text-[13px] font-semibold transition"
        :class="category === c ? 'bg-primary text-white' : 'bg-fig-block text-fig-text-secondary hover:text-fig-text-primary'"
        @click="category = c"
      >
        {{ $t(`guidesPage.categories.${c}`) }}
      </button>
    </div>

    <n-spin :show="loading" class="w-full">
      <div v-if="shown.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <GuideCard v-for="g in shown" :key="g.id" :guide="g" @open="open" />
      </div>
      <div v-else-if="!loading" class="flex flex-col items-center gap-2 py-16 text-center">
        <p class="text-[16px] font-semibold text-fig-text-primary">{{ $t(guides.length ? 'guidesPage.notFound' : 'guidesPage.empty') }}</p>
        <p class="text-[14px] text-fig-text-secondary">{{ $t(guides.length ? 'guidesPage.notFoundHint' : 'guidesPage.emptyHint') }}</p>
      </div>
    </n-spin>

    <GuidePlayer :guide="active" @close="active = null" />
  </UIPageContent>
</template>
