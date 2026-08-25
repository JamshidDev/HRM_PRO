<script setup>
  /**
   * Figma "Story" (node 2098:66567) — to'liq ekran story ko'ruvchisi.
   *
   * Maketda: moviy gradient fon + naqsh, yuqorida logotip va yopish tugmasi,
   * markazda 450x663 faol karta, ikki yonida 400x590 xiralashgan qo'shnilar,
   * markazdan ±290px da 40x40 o'tish tugmalari.
   *
   * KARUSEL. Barcha ko'rinadigan kartalar bir xil o'lchamda chiziladi va faqat
   * `transform` bilan joylashtiriladi: `translateX(offset * 445px) scale(s)`.
   * Yon kartalar maketda 400x590 — bu 450x663 ning aynan 0.889 ulushi, ya'ni
   * bitta `scale` maketni buzmasdan beradi. Shu sababli story almashganda
   * `left`/`width` emas, faqat `transform` va `opacity` o'zgaradi — o'tish
   * silliq va GPU'da bajariladi.
   *
   * Kartalar `story.id` bo'yicha kalitlangan: indeks o'zgarganda Vue DOM
   * tugunlarini almashtirmaydi, shuning uchun CSS o'tishi uzilmaydi.
   */
  import { useHomeStore } from '@/store/modules/index.js'
  import { useAppSetting, Utils } from '@/utils/index.js'
  import { Dismiss24Regular, ArrowLeft24Filled, ArrowRight24Filled } from '@vicons/fluent'
  import patternUrl from '@/assets/icons/home/welcome-pattern.png'

  const store = useHomeStore()

  // Rasm slaydi uchun ko'rsatish vaqti (backend faqat videoga `duration` beradi).
  const IMAGE_DURATION = 6000
  const TICK = 50

  // Faol kartadan qancha qo'shni DOM'da turadi. ±1 — maketda ko'rinadiganlar,
  // ±2 — keyingi qadamda silliq suzib kirishi uchun oldindan mount qilinadi.
  const VISIBLE_RANGE = 2
  const SIDE_SCALE = 0.889

  const slideIndex = ref(0)
  const elapsed = ref(0)
  let timer = null

  const sortedSlides = (story) =>
    [...(story?.slides ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))

  const slides = computed(() => sortedSlides(store.activeStory))
  const currentSlide = computed(() => slides.value[slideIndex.value] ?? null)

  const slideDuration = computed(() => {
    const slide = currentSlide.value
    if (slide?.media_type === 'video' && slide.duration) return slide.duration * 1000
    return IMAGE_DURATION
  })

  /** Ko'rinadigan kartalar: `{ story, index, offset }`, offset — faol kartadan siljish. */
  const carousel = computed(() => {
    const active = store.activeStoryIndex
    if (active === null) return []
    const out = []
    for (let i = active - VISIBLE_RANGE; i <= active + VISIBLE_RANGE; i += 1) {
      const story = store.stories[i]
      if (story) out.push({ story, index: i, offset: i - active })
    }
    return out
  })

  const cardStyle = (offset) => {
    const distance = Math.abs(offset)
    return {
      // Satr sifatida: CSS custom property'ga raqam berilganda qiymat
      // brauzerlararo bir xil serializatsiya qilinishiga tayanmaymiz.
      '--story-offset': String(offset),
      '--story-scale': String(offset === 0 ? 1 : SIDE_SCALE),
      // ±2 dagi kartalar joyida turadi, lekin ko'rinmaydi — keyingi qadamda
      // ular shu joydan suzib chiqadi.
      opacity: offset === 0 ? 1 : distance === 1 ? 0.3 : 0,
      zIndex: offset === 0 ? 2 : 1,
      pointerEvents: distance <= 1 ? 'auto' : 'none'
    }
  }

  const prevStory = computed(() =>
    store.activeStoryIndex === null ? null : (store.stories[store.activeStoryIndex - 1] ?? null)
  )
  const nextStory = computed(() =>
    store.activeStoryIndex === null ? null : (store.stories[store.activeStoryIndex + 1] ?? null)
  )

  // Strelkalar HAR DOIM maketdagi joyda turadi, lekin borish joyi bo'lmasa
  // o'chirilgan holatda: bitta slaydli yakka story'da ular ko'ruvchini
  // tasodifan yopib qo'ymaydi.
  const canPrev = computed(() => slideIndex.value > 0 || Boolean(prevStory.value))
  const canNext = computed(
    () => slideIndex.value < slides.value.length - 1 || Boolean(nextStory.value)
  )

  const stopTimer = () => {
    if (timer) clearInterval(timer)
    timer = null
  }

  const startTimer = () => {
    stopTimer()
    elapsed.value = 0
    if (!currentSlide.value) return
    timer = setInterval(() => {
      elapsed.value += TICK
      if (elapsed.value >= slideDuration.value) autoAdvance()
    }, TICK)
  }

  /** Slayddan slaydga; story chegarasida qo'shni story'ga o'tadi. */
  const stepSlide = (delta) => {
    const next = slideIndex.value + delta
    if (next >= 0 && next < slides.value.length) {
      slideIndex.value = next
      startTimer()
      return
    }
    store.stepStory(delta)
  }

  const onPrev = () => canPrev.value && stepSlide(-1)
  const onNext = () => canNext.value && stepSlide(1)

  /** Vaqt tugaganda: davomi bo'lsa keyingisiga, aks holda ko'ruvchi yopiladi. */
  const autoAdvance = () => {
    if (canNext.value) stepSlide(1)
    else store.closeStory()
  }

  // Story almashganda slayd hisoblagichi noldan boshlanadi.
  watch(
    () => store.activeStoryIndex,
    (v) => {
      if (v === null) {
        stopTimer()
        return
      }
      slideIndex.value = 0
      startTimer()
    }
  )

  // Ko'ruvchi ochiq turganda ortdagi sahifa skroll qilinmasin.
  watch(
    () => store.activeStoryIndex !== null,
    (open) => {
      document.body.style.overflow = open ? 'hidden' : ''
    }
  )

  const onKeyDown = (e) => {
    if (store.activeStoryIndex === null) return
    if (e.key === 'Escape') store.closeStory()
    else if (e.key === 'ArrowLeft') onPrev()
    else if (e.key === 'ArrowRight') onNext()
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    document.body.style.overflow = ''
    stopTimer()
  })

  /** Yon kartalar uchun muqova — birinchi rasm slaydi. */
  const coverOf = (story) => {
    const list = sortedSlides(story)
    return (
      list.find((s) => s.media_type === 'image')?.url ||
      list[0]?.url ||
      useAppSetting.noAvailableImage
    )
  }

  // 0..1 — faol kartadagi segment to'ldirilganlik ulushi.
  const segmentFill = (index) => {
    if (index < slideIndex.value) return 1
    if (index > slideIndex.value) return 0
    return Math.min(1, elapsed.value / slideDuration.value)
  }
</script>

<template>
  <Teleport to="body">
    <Transition name="story-fade">
      <div v-if="store.activeStory" class="story-viewer">
        <img :src="patternUrl" alt="" aria-hidden="true" class="story-viewer__pattern" />

        <!-- Sarlavha: logotip + yopish -->
        <div class="relative flex h-11 shrink-0 items-center justify-between px-10 pt-6">
          <div class="flex items-center gap-2.5">
            <img :src="useAppSetting.appLogoUrl" alt="" class="h-11 w-12 object-contain" />
            <span class="text-[18px] leading-6 font-semibold text-white">
              {{ $t('homePage.appName') }}
            </span>
          </div>

          <button
            type="button"
            class="story-viewer__close"
            :aria-label="$t('content.close')"
            @click="store.closeStory()"
          >
            <n-icon :size="20"><Dismiss24Regular /></n-icon>
          </button>
        </div>

        <!-- Tana: karusel. Bo'sh joyga bosilsa ko'ruvchi yopiladi. -->
        <div class="story-viewer__body" @click.self="store.closeStory()">
          <div
            v-for="item in carousel"
            :key="item.story.id"
            class="story-viewer__card"
            :class="{ 'is-active': item.offset === 0 }"
            :style="cardStyle(item.offset)"
            @click="item.offset !== 0 && store.openStory(item.index)"
          >
            <!-- Faol kartada joriy slayd, qo'shnilarda muqova -->
            <template v-if="item.offset === 0">
              <video
                v-if="currentSlide?.media_type === 'video'"
                :key="`v-${currentSlide.id}`"
                :src="currentSlide.url"
                class="story-viewer__media"
                autoplay
                muted
                playsinline
              />
              <img
                v-else
                :key="`i-${currentSlide?.id}`"
                :src="currentSlide?.url || useAppSetting.noAvailableImage"
                alt=""
                class="story-viewer__media"
                @error="Utils.onImgError"
              />
            </template>
            <img
              v-else
              :src="coverOf(item.story)"
              alt=""
              class="story-viewer__media"
              @error="Utils.onImgError"
            />

            <div class="story-viewer__overlay">
              <!-- Progress: slayd soniga qarab segmentlar. Bitta slaydda
                   natija maketdagi yakka chiziq bilan aynan bir xil.
                   Qo'shni kartalarda segmentlar bo'sh turadi. -->
              <div class="story-viewer__progress">
                <div
                  v-for="(slide, index) in sortedSlides(item.story)"
                  :key="slide.id"
                  class="h-[5px] flex-1 overflow-hidden rounded-full bg-white/40 backdrop-blur-[4px]"
                >
                  <div
                    class="h-full rounded-full bg-white"
                    :style="{ width: `${item.offset === 0 ? segmentFill(index) * 100 : 0}%` }"
                  />
                </div>
              </div>

              <div v-if="item.story.title || item.story.subtitle" class="story-viewer__caption">
                <!-- Maketda 24/30 va 16/24 edi; matn bloki karta pastiga
                     yopishgani uchun bir pog'ona kichraytirildi (loyiha
                     tipografiyasidagi Body L (600) va Body M (400)). -->
                <p class="line-clamp-2 text-[18px] leading-6 font-semibold">
                  {{ item.story.title }}
                </p>
                <p v-if="item.story.subtitle" class="text-[14px] leading-5 opacity-90">
                  {{ item.story.subtitle }}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="story-viewer__switch story-viewer__switch--prev"
            :disabled="!canPrev"
            :aria-label="$t('content.back')"
            @click="onPrev"
          >
            <n-icon :size="24"><ArrowLeft24Filled /></n-icon>
          </button>
          <button
            type="button"
            class="story-viewer__switch story-viewer__switch--next"
            :disabled="!canNext"
            :aria-label="$t('content.next')"
            @click="onNext"
          >
            <n-icon :size="24"><ArrowRight24Filled /></n-icon>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .story-viewer {
    position: fixed;
    inset: 0;
    z-index: 4000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* Maketdagi vertikal gradient (namunadan olingan: #0087fe -> #0654a0) */
    background-image: linear-gradient(180deg, #0087fe 0%, #0654a0 100%);
  }

  .story-viewer__pattern {
    position: absolute;
    top: 0;
    left: 50%;
    width: 955px;
    max-width: none;
    transform: translateX(-50%);
    opacity: 0.08;
    pointer-events: none;
  }

  .story-viewer__body {
    position: relative;
    flex: 1;
    min-height: 0;
    padding: 24px 40px;
  }

  /*
    Maketdagi koordinatalar (body 1360x784, markaz 680):
      faol karta   450x663, markazda
      yon kartalar 400x590 (= 0.889 x faol), markazdan ±445px
      strelkalar    40x40,  markazdan ±290px
    Barcha kartalar bir xil o'lchamda; farq faqat `scale` da — shu sababli
    o'tish `transform` bilan silliq animatsiya qilinadi.
  */
  .story-viewer__card {
    position: absolute;
    top: 50%;
    left: 50%;
    width: min(450px, calc(100vw - 32px));
    height: min(663px, 100%);
    overflow: hidden;
    border-radius: 16px;
    cursor: pointer;
    transform: translate(-50%, -50%) translateX(calc(var(--story-offset) * 445px))
      scale(var(--story-scale));
    transition:
      transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.45s ease;
    will-change: transform, opacity;
  }

  .story-viewer__card.is-active {
    cursor: default;
  }

  .story-viewer__card:not(.is-active):hover {
    opacity: 0.45 !important;
  }

  .story-viewer__media {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-viewer__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .story-viewer__progress {
    display: flex;
    width: 100%;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    padding: 16px 20px;
  }

  /*
    Matn bloki (maket: `bg-black/60` + `backdrop-blur(6px)`). Rang Tailwind
    palitrasi orqali emas, to'g'ridan-to'g'ri `rgba` bilan beriladi: loyihada
    `--color-*: initial` reseti bor va palitraga qo'shilmagan har qanday rang
    jimgina yo'qoladi — oq rasm ustida matn o'qilmay qolardi.
  */
  .story-viewer__caption {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 4px;
    /* Kartaning eng pastiga, chetdan chetga yopishadi. Radius bermaymiz:
       kartaning o'zida `overflow: hidden` bor, shuning uchun pastki
       burchaklar karta radiusi bo'yicha aniq qirqiladi. */
    padding: 16px 20px;
    color: #fff;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  /*
    Ko'ruvchi mavzudan qat'i nazar moviy fonda oq tugmalar bilan chiziladi,
    shuning uchun ikonka rangi ham qat'iy. Ilgari `text-fig-text-primary`
    ishlatilgan edi — tungi mavzuda u `#fcfcfd` ga aylanib, oq tugma ustida
    oq ikonka qolar va strelkalar butunlay ko'rinmasdi.
  */
  .story-viewer__close,
  .story-viewer__switch {
    display: flex;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: #fff;
    color: #101828;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .story-viewer__close:hover,
  .story-viewer__switch:hover {
    opacity: 0.9;
  }

  .story-viewer__switch {
    position: absolute;
    top: calc(50% - 20px);
    z-index: 3;
  }

  /* Borish joyi bo'lmasa — maketdagi joyida turadi, lekin bosilmaydi */
  .story-viewer__switch:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .story-viewer__switch--prev {
    left: calc(50% - 310px);
  }

  .story-viewer__switch--next {
    left: calc(50% + 270px);
  }

  /* Yon kartalar maketda 1440px ga hisoblangan — torroq ekranda ular faqat
     bir chetidan ko'rinib, xalaqit beradi. */
  @media (max-width: 1023px) {
    .story-viewer__card:not(.is-active) {
      display: none;
    }
  }

  /* Strelkalar markazdan ±290px da sig'masa — kontent chetlariga o'tadi */
  @media (max-width: 699px) {
    .story-viewer__body {
      padding: 16px;
    }

    .story-viewer__switch--prev {
      left: 8px;
    }

    .story-viewer__switch--next {
      left: auto;
      right: 8px;
    }
  }

  /* Harakatni kamaytirish so'ralgan bo'lsa — o'tish darhol */
  @media (prefers-reduced-motion: reduce) {
    .story-viewer__card {
      transition: none;
    }
  }

  .story-fade-enter-active,
  .story-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .story-fade-enter-from,
  .story-fade-leave-to {
    opacity: 0;
  }
</style>
