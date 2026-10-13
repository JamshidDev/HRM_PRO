<script setup>
  /**
   * «Qo'llanma» — web va mobil ilova bo'yicha video qo'llanmalar (grid, kategoriya, qidiruv, pleer).
   */
  import { UIPageContent, UISegmentTabs } from '@/components/index.js'
  import { Search20Regular, CheckmarkCircle16Filled } from '@vicons/fluent'
  import { formatDuration } from './categories.js'
  import GuideCard from './ui/GuideCard.vue'
  import GuidePlayer from './ui/GuidePlayer.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const platform = ref('web')
  const search = ref('')
  const loading = ref(false)
  const guides = ref([])
  const active = ref(null)

  const platformTabs = computed(() => [
    { id: 'web', name: t('guidesPage.platform.web') },
    { id: 'mobile', name: t('guidesPage.platform.mobile') }
  ])

  // O'rganish tartibidagi raqam (qidiruvda ham o'zgarmaydi).
  const stepOf = (g) => guides.value.indexOf(g) + 1

  const shown = computed(() => {
    const q = search.value.trim().toLowerCase()
    return guides.value.filter((g) => !q || g.title?.toLowerCase().includes(q))
  })

  const load = () => {
    loading.value = true
    $ApiService.videoGuideService
      ._index({ params: { platform: platform.value } })
      .then((res) => {
        guides.value = res.data.data || []
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
    </div>

    <n-spin :show="loading" class="w-full">
      <div v-if="shown.length" class="flex w-full flex-col gap-5 lg:flex-row lg:items-start">
        <div class="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <GuideCard v-for="g in shown" :key="g.id" :guide="g" :step="stepOf(g)" @open="open" />
        </div>

        <!-- O'rganish tartibi: videolarni shu ketma-ketlikda ko'rish tavsiya etiladi. -->
        <aside class="flex w-full shrink-0 flex-col gap-2 rounded-2xl bg-fig-block p-3 shadow-card lg:sticky lg:top-4 lg:w-80">
          <div class="flex flex-col gap-0.5 px-1 pb-1">
            <div class="flex items-center justify-between">
              <p class="text-[15px] font-semibold text-fig-text-primary">{{ $t('guidesPage.sequence') }}</p>
              <span class="text-[12px] text-fig-text-secondary">{{ $t('guidesPage.count', { n: guides.length }) }}</span>
            </div>
            <p class="text-[12px] text-fig-text-secondary">{{ $t('guidesPage.sequenceHint') }}</p>
          </div>
          <button
            v-for="g in shown"
            :key="g.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-surface-ground"
            :class="active?.id === g.id ? 'bg-fig-chip-brand' : ''"
            @click="open(g)"
          >
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
              :class="active?.id === g.id ? 'bg-primary text-white' : 'bg-surface-ground text-fig-text-secondary'"
            >
              {{ stepOf(g) }}
            </span>
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="line-clamp-2 text-[13px] leading-[18px] font-medium text-fig-text-primary">{{ g.title }}</span>
              <span class="flex items-center gap-1 text-[12px] text-fig-text-secondary">
                {{ formatDuration(g.duration) }}
                <n-icon v-if="g.is_viewed" size="13" class="text-fig-chip-green-text"><CheckmarkCircle16Filled /></n-icon>
              </span>
            </span>
          </button>
        </aside>
      </div>
      <div v-else-if="!loading" class="flex flex-col items-center gap-2 py-16 text-center">
        <p class="text-[16px] font-semibold text-fig-text-primary">{{ $t(guides.length ? 'guidesPage.notFound' : 'guidesPage.empty') }}</p>
        <p class="text-[14px] text-fig-text-secondary">{{ $t(guides.length ? 'guidesPage.notFoundHint' : 'guidesPage.emptyHint') }}</p>
      </div>
    </n-spin>

    <GuidePlayer :guide="active" @close="active = null" />
  </UIPageContent>
</template>
