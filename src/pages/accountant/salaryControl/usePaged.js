// Uzun ro'yxatlar uchun client-side pagination (DAS-16729 perf).
// Native <tr v-for> jadvallar minglab qatorni bir vaqtda chizib UI'ni qotirardi —
// bu composable faqat joriy sahifa qatorlarini qaytaradi.
//   const { page, paged, pageCount, total } = usePaged(rowsRef, 50)
//   <tr v-for="r in paged">  +  <n-pagination v-model:page="page" :page-count="pageCount" />
import { ref, computed, watch } from 'vue'

export function usePaged(source, size = 50) {
  const page = ref(1)
  const pageSize = ref(size)
  const total = computed(() => (source.value || []).length)
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const paged = computed(() => {
    const arr = source.value || []
    const start = (page.value - 1) * pageSize.value
    return arr.slice(start, start + pageSize.value)
  })
  // Manba o'zgarsa (filtr/qidiruv/davr) — joriy sahifa chegaradan oshsa 1-ga qaytamiz.
  watch(total, () => {
    if (page.value > pageCount.value) page.value = 1
  })
  return { page, pageSize, total, pageCount, paged }
}
