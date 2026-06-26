<script setup>
  const props = defineProps({
    questions: {
      type: Array,
      default: () => []
    },
    // CSS selector of the scrollable questions container (scroll-spy root)
    rootSelector: {
      type: String,
      default: null
    }
  })

  const currentIndex = ref(0)
  let observer = null

  const answeredCount = computed(() => props.questions.filter((q) => !!q.result).length)

  const setupObserver = () => {
    if (observer) observer.disconnect()
    const root = props.rootSelector ? document.querySelector(props.rootSelector) : null
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.id.replace('question-', '')) - 1
            if (!Number.isNaN(idx)) currentIndex.value = idx
          }
        })
      },
      { root, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    props.questions.forEach((_, idx) => {
      const el = document.getElementById(`question-${idx + 1}`)
      if (el) observer.observe(el)
    })
  }

  onMounted(() => nextTick(setupObserver))
  watch(
    () => props.questions.length,
    () => nextTick(setupObserver)
  )
  onBeforeUnmount(() => observer && observer.disconnect())
</script>

<template>
  <div class="flex flex-col gap-3 h-full">
    <div class="flex items-center justify-between shrink-0">
      <span class="font-semibold text-textColor0">{{ $t('solveExamPage.palette') }}</span>
      <span class="text-sm font-medium text-textColor3">
        {{ answeredCount }}/{{ questions.length }}
      </span>
    </div>

    <div class="grow overflow-y-auto overflow-x-hidden min-h-0">
      <div class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(38px,1fr))] p-1">
        <a
          v-for="(question, idx) in questions"
          :key="idx"
          :href="`#question-${idx + 1}`"
          class="aspect-square flex justify-center items-center text-sm font-semibold rounded-lg border transition-colors"
          :class="
            !!question.result
              ? 'bg-primary text-white border-transparent'
              : 'bg-surface-section text-textColor2 border-surface-line hover:border-primary'
          "
          :style="currentIndex === idx ? 'box-shadow: 0 0 0 2px var(--primary-color)' : ''"
        >
          {{ idx + 1 }}
        </a>
      </div>
    </div>

    <div
      class="shrink-0 flex flex-col gap-2 text-xs text-textColor3 border-t border-surface-line pt-3"
    >
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded bg-primary inline-block shrink-0"></span>
        {{ $t('solveExamPage.legendAnswered') }}
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded border border-surface-line inline-block shrink-0"></span>
        {{ $t('solveExamPage.legendEmpty') }}
      </div>
    </div>
  </div>
</template>
