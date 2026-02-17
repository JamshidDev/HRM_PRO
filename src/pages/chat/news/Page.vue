<script setup>
  import NewsCard from './ui/NewsCard.vue'
  import { UIPageContent } from '@/components/index.js'
  import { News24Regular } from '@vicons/fluent'

  const PAGE_SIZE = 12

  const list = ref([])
  const page = ref(0)
  const loading = ref(false)
  const hasMore = ref(true)
  const sentinel = ref(null)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    loading.value = true

    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))

    const nextPage = page.value + 1
    const total = 50 // mock total
    const newItems = Array.from({ length: PAGE_SIZE }, (_, i) => page.value * PAGE_SIZE + i + 1)

    list.value.push(...newItems)
    page.value = nextPage
    hasMore.value = list.value.length < total
    loading.value = false
  }

  onMounted(() => {
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
    <div
      v-if="list.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <NewsCard v-for="i in list" :key="i" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-24 text-center">
      <div
        class="w-16 h-16 rounded-2xl bg-surface-section border border-surface-line flex items-center justify-center mb-4"
      >
        <n-icon size="32" class="text-textColor3">
          <News24Regular />
        </n-icon>
      </div>
      <p class="text-base font-semibold text-textColor1 mb-1">No news yet</p>
      <p class="text-sm text-textColor3">Published articles will appear here</p>
    </div>

    <!-- Sentinel + loader -->
    <div ref="sentinel" class="mt-8 flex justify-center">
      <n-spin v-if="loading" size="medium" />
      <p v-else-if="!hasMore && list.length" class="text-sm text-textColor3 py-4">
        You've reached the end
      </p>
    </div>
  </UIPageContent>
</template>
