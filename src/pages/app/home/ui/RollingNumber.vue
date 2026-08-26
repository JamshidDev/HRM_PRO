<script setup>
  /**
   * "Odometr" ko'rinishidagi raqam: qiymat o'zgarganda har bir xona
   * vertikal aylanib yangi raqamga o'tadi (o'sganda tepaga, kamayganda pastga).
   *
   * Socket'dan kelgan online xodimlar soni uchun yozilgan: son sakrab
   * almashinmasin, o'zgarish ko'zga tashlanib turadi.
   *
   * O'lcham va rang tashqaridan (matn klasslaridan) olinadi — komponent faqat
   * qatorlar balandligini boshqaradi.
   */
  const props = defineProps({
    value: {
      type: Number,
      default: 0
    },
    // Bir xonaning aylanish vaqti (ms)
    duration: {
      type: Number,
      default: 700
    }
  })

  /**
   * Xonalar o'ngdan chapga raqamlanadi (`place`): 138 -> 2,1,0. Kalit shu
   * bo'lgani uchun son xona qo'shganda (95 -> 138) eski xonalar joyida
   * aylanadi, chapga esa faqat yangi xona qo'shiladi.
   */
  const places = computed(() => {
    const digits = String(Math.max(0, Math.round(props.value || 0))).split('')

    return digits.map((digit, index) => ({
      place: digits.length - 1 - index,
      digit: Number(digit)
    }))
  })

  // Yo'nalish: o'sganda lenta tepaga, kamayganda pastga suriladi.
  const isDown = ref(false)

  watch(
    () => props.value,
    (next, prev) => {
      isDown.value = Number(next) < Number(prev)
    }
  )
</script>

<template>
  <span
    class="rolling-number"
    :class="{ 'rolling-number--down': isDown }"
    :style="{ '--rolling-duration': `${duration}ms` }"
  >
    <!-- Ekran o'quvchisi uchun butun son — aylanuvchi lentalar unga chalkash -->
    <span class="sr-only">{{ value }}</span>

    <TransitionGroup name="rolling-place" aria-hidden="true">
      <span
        v-for="(item, index) in places"
        :key="item.place"
        class="rolling-number__place"
        :style="{ '--rolling-delay': `${index * 60}ms` }"
      >
        <span
          class="rolling-number__strip"
          :style="{ transform: `translateY(${-10 * item.digit}%)` }"
        >
          <span v-for="n in 10" :key="n" class="rolling-number__cell">{{ n - 1 }}</span>
        </span>
      </span>
    </TransitionGroup>
  </span>
</template>

<style scoped>
  .rolling-number {
    /* Chiqib ketayotgan xona `absolute` bo'ladi — tayanch nuqta shu element */
    position: relative;
    display: inline-flex;
    /* Raqamlar bir xil kenglikda bo'lmasa lenta aylanganda son "qimirlaydi" */
    font-variant-numeric: tabular-nums;
    line-height: 1.25;
  }

  .rolling-number__place {
    display: inline-block;
    height: 1.25em;
    overflow: hidden;
  }

  .rolling-number__strip {
    display: flex;
    flex-direction: column;
    transition: transform var(--rolling-duration) cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--rolling-delay, 0ms);
    will-change: transform;
  }

  .rolling-number__cell {
    /* Lentaning har bir qatori aynan bir xil balandlikda bo'lishi shart */
    display: flex;
    height: 1.25em;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
  }

  /* Yangi xona (masalan 95 -> 138) chapdan siljib kirib keladi */
  .rolling-place-enter-active,
  .rolling-place-leave-active {
    transition:
      opacity var(--rolling-duration) ease,
      transform var(--rolling-duration) cubic-bezier(0.22, 1, 0.36, 1);
  }

  .rolling-place-enter-from,
  .rolling-place-leave-to {
    opacity: 0;
    transform: translateY(-0.35em) scale(0.7);
  }

  .rolling-number--down .rolling-place-enter-from,
  .rolling-number--down .rolling-place-leave-to {
    transform: translateY(0.35em) scale(0.7);
  }

  .rolling-place-leave-active {
    position: absolute;
  }

  @media (prefers-reduced-motion: reduce) {
    .rolling-number__strip,
    .rolling-place-enter-active,
    .rolling-place-leave-active {
      transition: none;
    }
  }
</style>
