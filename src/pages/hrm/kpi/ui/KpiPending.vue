<script setup>
  // KPI ma'lumoti hali yo'q holati.
  //
  // Ikki sabab bir xil ko'rinadi (buyurtmachi qarori): xodim KPI tizimiga ulanmagan
  // YOKI tanlangan davr uchun natija hali hisoblanmagan. Foydalanuvchi uchun ikkalasi
  // ham "hali tayyor emas" — shuning uchun xato emas, KUTISH holati ko'rsatiladi.
  //
  // Animatsiya to'liq CSS/SVG (yangi paket yo'q): aylanuvchi punktir halqa =
  // hisob-kitob davom etyapti, ichidagi ustunchalar "o'sib-kamayadi" = ko'rsatkichlar
  // yig'ilyapti, pastdagi skeleton qatorlar esa kelajakdagi jadval o'rnini bildiradi.
  defineProps({
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  })
</script>

<template>
  <div class="kpi-pending">
    <div class="kpi-pending__art" aria-hidden="true">
      <svg viewBox="0 0 120 120" class="kpi-pending__svg">
        <!-- tayanch halqa -->
        <circle class="kpi-pending__track" cx="60" cy="60" r="50" />
        <!-- aylanuvchi punktir yoy — "hisoblanmoqda" -->
        <circle class="kpi-pending__arc" cx="60" cy="60" r="50" />
        <!-- ichkarida o'sib-kamayuvchi ustunchalar — yig'ilayotgan ko'rsatkichlar -->
        <g class="kpi-pending__bars">
          <rect x="44" y="52" width="7" height="20" rx="3" />
          <rect x="56" y="46" width="7" height="26" rx="3" />
          <rect x="68" y="58" width="7" height="14" rx="3" />
        </g>
      </svg>
    </div>

    <h4 class="kpi-pending__title">
      {{ title }}<span class="kpi-pending__dots"><i>.</i><i>.</i><i>.</i></span>
    </h4>
    <p class="kpi-pending__desc">{{ description }}</p>

    <!-- Kelajakdagi jadval o'rni — shimmer skeleton qatorlar -->
    <div class="kpi-pending__skeleton">
      <span v-for="n in 3" :key="n" :style="{ animationDelay: `${n * 0.15}s` }"></span>
    </div>
  </div>
</template>

<style scoped>
  .kpi-pending {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 480px;
    padding: 24px;
    text-align: center;
  }

  .kpi-pending__art {
    width: 132px;
    height: 132px;
    margin-bottom: 6px;
  }
  .kpi-pending__svg {
    width: 100%;
    height: 100%;
  }

  .kpi-pending__track {
    fill: none;
    stroke: var(--surface-line, #e5e7eb);
    stroke-width: 8;
  }

  /* Punktir yoy sekin aylanadi — jarayon davom etayotganini bildiradi. */
  .kpi-pending__arc {
    fill: none;
    stroke: var(--info-color, #0062ff);
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 60 254;
    transform-origin: 60px 60px;
    animation: kpi-spin 1.6s linear infinite;
  }

  .kpi-pending__bars rect {
    fill: var(--info-color, #0062ff);
    opacity: 0.35;
    transform-origin: center bottom;
    animation: kpi-bar 1.4s ease-in-out infinite;
  }
  .kpi-pending__bars rect:nth-child(2) {
    animation-delay: 0.2s;
  }
  .kpi-pending__bars rect:nth-child(3) {
    animation-delay: 0.4s;
  }

  .kpi-pending__title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--textColor0);
  }
  .kpi-pending__dots i {
    font-style: normal;
    opacity: 0;
    animation: kpi-dot 1.2s infinite;
  }
  .kpi-pending__dots i:nth-child(2) {
    animation-delay: 0.2s;
  }
  .kpi-pending__dots i:nth-child(3) {
    animation-delay: 0.4s;
  }

  .kpi-pending__desc {
    margin: 0;
    max-width: 420px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--textColor2);
  }

  .kpi-pending__skeleton {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 460px;
    margin-top: 18px;
  }
  .kpi-pending__skeleton span {
    height: 10px;
    border-radius: 6px;
    background: linear-gradient(
      90deg,
      var(--surface-ground, #eef2ff) 25%,
      var(--surface-line, #e5e7eb) 37%,
      var(--surface-ground, #eef2ff) 63%
    );
    background-size: 400% 100%;
    animation: kpi-shimmer 1.6s ease infinite;
  }
  .kpi-pending__skeleton span:nth-child(2) {
    width: 85%;
  }
  .kpi-pending__skeleton span:nth-child(3) {
    width: 65%;
  }

  @keyframes kpi-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes kpi-bar {
    0%,
    100% {
      transform: scaleY(0.55);
      opacity: 0.3;
    }
    50% {
      transform: scaleY(1.25);
      opacity: 0.75;
    }
  }
  @keyframes kpi-dot {
    0%,
    100% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
  }
  @keyframes kpi-shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }

  /* Harakatni kamaytirish sozlamasi yoqilgan bo'lsa — animatsiyasiz, tinch holat. */
  @media (prefers-reduced-motion: reduce) {
    .kpi-pending__arc,
    .kpi-pending__bars rect,
    .kpi-pending__dots i,
    .kpi-pending__skeleton span {
      animation: none;
    }
    .kpi-pending__dots i {
      opacity: 1;
    }
  }
</style>
