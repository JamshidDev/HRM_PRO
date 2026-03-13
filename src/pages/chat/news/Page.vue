<script setup>
  import NewsCard from './ui/NewsCard.vue'
  import Filter from './ui/Filter.vue'
  import { UIPageContent } from '@/components/index.js'
  import { News24Regular } from '@vicons/fluent'
  import { useNewsStore } from '@/store/modules/index.js'

  const store = useNewsStore()

  const items = ref([])
  const sentinel = ref(null)
  const hasMore = computed(() => !store.totalItems || items.value.length < store.totalItems)

  watch(
    () => store.list,
    (newList) => {
      items.value.push(...newList)
    }
  )

  const loadMore = () => {
    if (store.loading || !hasMore.value) return
    store._index()
    store.params.page++
  }

  const onFilter = () => {
    items.value = []
    store.params.page = 1
    loadMore()
  }

  const onCardRemove = (id) => {
    items.value = items.value.filter((i) => i.id !== id)
    store.totalItems--
  }

  onMounted(() => {
    store.params.page = 1
    items.value = []
    loadMore()

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 }
    )

    watchEffect(() => {
      if (sentinel.value) observer.observe(sentinel.value)
    })

    onUnmounted(() => observer.disconnect())
  })
</script>

<template>
  <UIPageContent>
    <Filter @filter="onFilter" class="mb-4" />

    <div
      v-if="items.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <NewsCard v-for="(item, index) in items" :key="item.id" v-model="items[index]" @remove="onCardRemove" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!store.loading"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-surface-section border border-surface-line flex items-center justify-center mb-4"
      >
        <n-icon size="32" class="text-textColor3">
          <News24Regular />
        </n-icon>
      </div>
      <p class="text-base font-semibold text-textColor1 mb-1">{{ $t('newsPage.noNews') }}</p>
      <p class="text-sm text-textColor3">{{ $t('newsPage.noNewsSubtitle') }}</p>
    </div>

    <!-- Sentinel + loader -->
    <div ref="sentinel" class="mt-8 flex justify-center">
      <n-spin v-if="store.loading" size="medium" />
      <p v-else-if="!hasMore && items.length" class="text-sm text-textColor3 py-4">
        {{ $t('newsPage.endOfList') }}
      </p>
    </div>
  </UIPageContent>
</template>
