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
  let root = null
  let rafId = null
  let locked = false

  const answeredCount = computed(() => props.questions.filter((q) => !!q.result).length)

  const getRoot = () => (props.rootSelector ? document.querySelector(props.rootSelector) : null)

  // Scroll-spy: chekkalarni (eng yuqori/eng past) ham hisobga oladi, shu sababli
  // birinchi va oxirgi savol ham to'g'ri aktiv bo'ladi.
  const updateActive = () => {
    if (!root) return
    const total = props.questions.length
    if (!total) return

    const { scrollTop, scrollHeight, clientHeight } = root

    // Tepaga to'liq scroll qilinganda → birinchi savol
    if (scrollTop <= 4) {
      currentIndex.value = 0
      return
    }
    // Pastga to'liq scroll qilinganda → oxirgi savol
    if (scrollTop + clientHeight >= scrollHeight - 4) {
      currentIndex.value = total - 1
      return
    }

    // Aks holda: tepa qismdagi mos chiziqdan yuqorida boshlangan eng oxirgi savol.
    // Anchor orqali o'tilganda savol tepaga scroll qilinadi, shu sababli markaz emas,
    // tepa chiziq olinadi — aks holda aktiv bittaga siljib ketadi.
    const refLine = root.getBoundingClientRect().top + 32
    let active = 0
    for (let i = 0; i < total; i++) {
      const el = document.getElementById(`question-${i + 1}`)
      if (!el) continue
      if (el.getBoundingClientRect().top - refLine <= 0) {
        active = i
      } else {
        break
      }
    }
    currentIndex.value = active
  }

  const onScroll = () => {
    // Palitradan bosilgan bo'lsa (locked), foydalanuvchi o'zi scroll qilguncha
    // spy aralashmaydi — aks holda oxirgi savollarda (tail) aktiv siljib ketadi.
    if (locked || rafId) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      updateActive()
    })
  }

  // Palitradagi raqam bosilganda o'sha savolni darhol aktiv qilamiz va spy'ni qulflaymiz
  const onPaletteClick = (idx) => {
    currentIndex.value = idx
    locked = true
  }

  // Foydalanuvchi o'zi scroll qilsa (wheel/touch), qulfni ochamiz
  const unlock = () => {
    if (!locked) return
    locked = false
    updateActive()
  }

  const bindRoot = (el) => {
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', unlock, { passive: true })
    el.addEventListener('touchmove', unlock, { passive: true })
  }
  const unbindRoot = (el) => {
    el.removeEventListener('scroll', onScroll)
    el.removeEventListener('wheel', unlock)
    el.removeEventListener('touchmove', unlock)
  }

  const setupSpy = () => {
    if (root) unbindRoot(root)
    root = getRoot()
    if (!root) return
    bindRoot(root)
    updateActive()
  }

  onMounted(() => nextTick(setupSpy))
  watch(
    () => props.questions.length,
    () => nextTick(setupSpy)
  )
  onBeforeUnmount(() => {
    if (root) unbindRoot(root)
    if (rafId) cancelAnimationFrame(rafId)
  })
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
          @click="onPaletteClick(idx)"
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
