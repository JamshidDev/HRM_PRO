<script setup>
  /**
   * Figma "Stories Desktop" (node 4054:30039) — to'liq ekran story ko'ruvchisi.
   *
   * Maketda: ko'k-yashil gradient fon + naqsh, yuqorida logotip va yopish tugmasi,
   * markazda 450x663 «shisha» faol karta (oq 16% + blur), ikki yonida 400x590
   * qo'shnilar (oq 8%, ichi 40% shaffof), markazdan ±290px da 40x40 o'tish
   * tugmalari. Faol kartada matn — qora shisha kartochka, qo'shnilarda — oq.
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
  // Maketdagi naqsh (4054:30040) — oq, 4% shaffof vektor; 90° burilib, vertikal aks ettirilgan.
  import patternUrl from '@/assets/images/home/story-pattern.svg?url'

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
      // Yon kartaning o'zi (oq 8% foni) ko'rinadi, ichi `.story-viewer__inner` da 40%.
      opacity: distance <= 1 ? 1 : 0,
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

  /*
    Maket 1440x900 kadrga chizilgan (tana 1360x784). Karusel shu o'lchamdagi «sahna»da
    aynan maketdagi pikselda joylashadi va sahna ekranga moslab kattalashtiriladi/kichraytiriladi —
    katta ekranda ham proporsiyalar maketdagidek qoladi (ilgari 1920px ekranda kartalar kichik ko'rinardi).
    Tana: eni = ekran − 80 (40+40), bo'yi = ekran − 116 (sarlavha 68 + yuqori/pastki 24).
  */
  const STAGE_W = 1360
  const STAGE_H = 784
  const stageScale = ref(1)
  const updateStageScale = () => {
    stageScale.value = Math.min((window.innerWidth - 80) / STAGE_W, (window.innerHeight - 116) / STAGE_H)
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', updateStageScale)
    updateStageScale()
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', updateStageScale)
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
        <div class="story-viewer__pattern" aria-hidden="true">
          <img :src="patternUrl" alt="" width="500" height="955" />
        </div>

        <!-- Sarlavha: logotip + yopish -->
        <!-- Maket: tepadan 24px, qator balandligi 44px (logotip 48x44) -->
        <div class="relative flex shrink-0 items-center justify-between px-10 pt-6">
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
            <n-icon :size="24"><Dismiss24Regular /></n-icon>
          </button>
        </div>

        <!-- Tana: karusel. Bo'sh joyga bosilsa ko'ruvchi yopiladi. -->
        <div class="story-viewer__body" @click.self="store.closeStory()">
          <!-- Sahna: maketdagi 1360x784 tana, ekranga moslab masshtablanadi (telefonda — oddiy). -->
          <div
            class="story-viewer__stage"
            :style="{ '--stage-scale': String(stageScale) }"
            @click.self="store.closeStory()"
          >
            <div
              v-for="item in carousel"
              :key="item.story.id"
              class="story-viewer__card"
              :class="{ 'is-active': item.offset === 0 }"
              :style="cardStyle(item.offset)"
              @click="item.offset !== 0 && store.openStory(item.index)"
            >
              <div class="story-viewer__inner">
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
                  <!-- Faol kartada — har slayd uchun segment; qo'shnilarda maketdagidek bitta
                       chiziq: ko'rilgan story'da to'la, yangisida bo'sh. -->
                  <div class="story-viewer__progress">
                    <template v-if="item.offset === 0">
                      <div
                        v-for="(slide, index) in sortedSlides(item.story)"
                        :key="slide.id"
                        class="story-viewer__segment"
                      >
                        <div
                          class="h-full rounded-full bg-white"
                          :style="{ width: `${segmentFill(index) * 100}%` }"
                        />
                      </div>
                    </template>
                    <div v-else class="story-viewer__segment">
                      <div
                        class="h-full rounded-full bg-white"
                        :style="{ width: item.story.is_seen ? '100%' : '0%' }"
                      />
                    </div>
                  </div>

                  <!-- Maket: faol kartada qora shisha kartochka (24/30 + 16/24),
                       qo'shnilarda oq kartochka. -->
                  <div v-if="item.story.title || item.story.subtitle" class="story-viewer__caption">
                    <p class="story-viewer__caption-title line-clamp-2">
                      {{ item.story.title }}
                    </p>
                    <p v-if="item.story.subtitle" class="story-viewer__caption-text line-clamp-3">
                      {{ item.story.subtitle }}
                    </p>
                  </div>
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
    /* Maket (4054:30039): blue/700 -> green/300 -> blue/400. Ko'ruvchi mavzudan
       qat'i nazar bir xil, shu bois ranglar qat'iy. Figma eksportidagi to'xtash nuqtalari
       (4.44% / 32.67%) brauzerda pastni to'qroq chizadi — maket rasmidan o'lchab moslangan. */
    background-image: linear-gradient(-7.39deg, #175cd3 -4%, #8fe0a4 32.5%, #53b1fd 100.24%);
  }

  /* Maket: 955x500 quti tepada markazda; ichidagi 500x955 vektor `rotate(90deg) scaleY(-1)` */
  .story-viewer__pattern {
    position: absolute;
    top: 0;
    left: 50%;
    display: flex;
    width: 955px;
    height: 500px;
    align-items: center;
    justify-content: center;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .story-viewer__pattern img {
    flex: none;
    max-width: none;
    transform: rotate(90deg) scaleY(-1);
  }

  .story-viewer__body {
    position: relative;
    flex: 1;
    min-height: 0;
    padding: 24px 40px;
  }

  /* Telefon/planshetda sahna — tananing o'zi (masshtabsiz, eski joylashuv) */
  .story-viewer__stage {
    position: absolute;
    inset: 0;
  }

  /* Kompyuterda: maketdagi 1360x784 sahna, markazda, ekranga moslab masshtablanadi */
  @media (min-width: 1024px) {
    .story-viewer__stage {
      inset: auto;
      top: 50%;
      left: 50%;
      width: 1360px;
      height: 784px;
      transform: translate(-50%, -50%) scale(var(--stage-scale, 1));
    }

    .story-viewer__stage .story-viewer__card {
      width: 450px;
      height: 663px;
    }
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
    /* Yon karta — oq 8% «shisha» */
    background: rgba(255, 255, 255, 0.08);
    transform: translate(-50%, -50%) translateX(calc(var(--story-offset) * 445px))
      scale(var(--story-scale));
    transition:
      transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.45s ease;
    will-change: transform, opacity;
  }

  .story-viewer__card.is-active {
    cursor: default;
    background: transparent;
  }

  /* Faol karta — oq 16% + blur(8px). Alohida qatlamda: kartaning O'ZIDA `backdrop-filter`
     bo'lsa, Chrome ichidagi matn kartochkasining `backdrop-filter` ini chizmaydi
     (ichma-ich blur) — kartochka ostidagi rasm xiralashmay qolardi. */
  .story-viewer__card.is-active::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  /* Rasm va matn bitta qatlamda: yon kartada 40% shaffof (maketdagi `opacity-40`) */
  .story-viewer__inner {
    position: absolute;
    inset: 0;
    transition: opacity 0.45s ease;
  }

  .story-viewer__card:not(.is-active) .story-viewer__inner {
    opacity: 0.4;
  }

  .story-viewer__card:not(.is-active):hover .story-viewer__inner {
    opacity: 0.55;
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

  /* Faol karta: 3px segmentlar, orasi 8px, chetdan 36px (karta 20 + progress 16) */
  .story-viewer__progress {
    display: flex;
    width: 100%;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    padding: 16px 36px;
  }

  .story-viewer__segment {
    height: 3px;
    flex: 1;
    overflow: hidden;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.5);
  }

  /*
    Yon karta 450x663 o'lchamda chizilib 0.889 ga kichraytiriladi (= maketdagi 400x590).
    Ichidagi o'lchamlar maketda KICHRAYMAGAN (matn 24/16, chetlar 20/16), shuning uchun
    ular 1/0.889 ga bo'linadi — ekranda aynan maketdagi qiymat chiqadi.
  */
  .story-viewer__card:not(.is-active) .story-viewer__progress {
    padding: 18px 22.5px;
  }

  .story-viewer__card:not(.is-active) .story-viewer__segment {
    height: 5.6px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(4px);
  }

  /*
    Matn kartochkasi. Faol kartada — qora shisha (maket: `rgba(0,0,0,.5)` +
    `blur(29.5px)`, radius 24, 20/16 ichki joy), kartaning 20px ichida, pastdan
    16px. Rang Tailwind palitrasi orqali emas, `rgba` bilan: loyihada
    `--color-*: initial` reseti bor va palitraga qo'shilmagan rang jimgina yo'qoladi.
  */
  .story-viewer__caption {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0 20px 16px;
    padding: 16px 20px;
    border-radius: 24px;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(29.5px);
    -webkit-backdrop-filter: blur(29.5px);
  }

  .story-viewer__caption-title {
    font-size: 24px;
    line-height: 30px;
    font-weight: 600;
  }

  .story-viewer__caption-text {
    font-size: 16px;
    line-height: 24px;
    opacity: 0.8;
  }

  /* Yon kartada — oq kartochka, to'q matn (maket: radius 10, ichki joy 16; /0.889) */
  .story-viewer__card:not(.is-active) .story-viewer__caption {
    gap: 4.5px;
    margin: 0 22.5px 18px;
    padding: 18px;
    border-radius: 11.25px;
    color: #101828;
    background: #fff;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .story-viewer__card:not(.is-active) .story-viewer__caption-title {
    font-size: 27px;
    line-height: 33.75px;
  }

  .story-viewer__card:not(.is-active) .story-viewer__caption-text {
    font-size: 18px;
    line-height: 27px;
    color: #344054;
    opacity: 1;
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
    color: #0f172a;
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

    /* Telefonda maketdagi 24/16 juda katta — bir pog'ona kichik */
    .story-viewer__caption-title {
      font-size: 18px;
      line-height: 24px;
    }

    .story-viewer__caption-text {
      font-size: 14px;
      line-height: 20px;
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

<style>
  /*
    Qorong'i rejim — Figma «Asosiy - Dark» → Story (node 5121:3747). Yorug' rejimdagi
    joylashuv o'zgarmaydi, faqat ranglar/shisha: to'q ko'k fon, shisha tugmalar, yon kartalarda
    4% oq + 6% chegara (ichi 32%), faol kartada chegara + ko'k nur, matn kartochkasi — to'q shisha.
    Yon karta 0.889 ga kichraytirilgani uchun uning ichidagi o'lchamlar /0.889.
  */
  [data-theme='dark'] .story-viewer {
    background-image: linear-gradient(-7.39deg, #071428 4.44%, #0a2233 53.14%, #0c1f45 100.24%);
  }

  /* Naqsh — maketda 2% (yorug'da 4%) */
  [data-theme='dark'] .story-viewer__pattern img {
    opacity: 0.5;
  }

  [data-theme='dark'] .story-viewer__close,
  [data-theme='dark'] .story-viewer__switch {
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  [data-theme='dark'] .story-viewer__card {
    border: 1.125px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.04);
  }

  [data-theme='dark'] .story-viewer__card.is-active {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    box-shadow:
      0 0 80px 0 rgba(46, 144, 250, 0.18),
      0 24px 56px 0 rgba(0, 0, 0, 0.55);
  }

  [data-theme='dark'] .story-viewer__card.is-active::before {
    display: none;
  }

  [data-theme='dark'] .story-viewer__card:not(.is-active) .story-viewer__inner {
    opacity: 0.32;
  }

  [data-theme='dark'] .story-viewer__card:not(.is-active):hover .story-viewer__inner {
    opacity: 0.45;
  }

  /* Progress — 5px chiziqlar (oq 40% + blur 4), faol kartada ham */
  [data-theme='dark'] .story-viewer__card.is-active .story-viewer__progress {
    gap: 4px;
    padding: 16px 20px;
  }

  [data-theme='dark'] .story-viewer__card.is-active .story-viewer__segment {
    height: 5px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(4px);
  }

  /* Matn kartochkasi — to'q shisha, radius 10, ichki joy 16 */
  [data-theme='dark'] .story-viewer__caption {
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: #f9fafb;
    background: rgba(10, 18, 32, 0.72);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  [data-theme='dark'] .story-viewer__caption-text {
    color: #d0d5dd;
    opacity: 1;
  }

  [data-theme='dark'] .story-viewer__card:not(.is-active) .story-viewer__caption {
    padding: 18px;
    border: 1.125px solid rgba(255, 255, 255, 0.08);
    border-radius: 11.25px;
    color: #f9fafb;
    background: rgba(10, 18, 32, 0.72);
    backdrop-filter: blur(11.25px);
    -webkit-backdrop-filter: blur(11.25px);
  }

  [data-theme='dark'] .story-viewer__card:not(.is-active) .story-viewer__caption-text {
    color: #d0d5dd;
  }
</style>
