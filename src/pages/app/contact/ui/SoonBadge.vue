<script setup>
  /**
   * "Tez kunda" belgisi — hali ishlamayotgan bo'limlar (FAQ, AI chatbot)
   * darhol ko'zga tashlansin.
   *
   * Maketda bu och indigo chip edi va oq karta fonida deyarli ko'rinmasdi.
   * Shu sababli issiq to'ldirilgan chip (amber -> orange gradient, oq matn),
   * yumshoq halo va sekin "pulsatsiya" qiluvchi nuqta qo'shildi. Ranglar
   * `--fig-icon-*` o'zgaruvchilaridan — dark rejada o'zi moslashadi.
   */
  defineProps({
    text: {
      type: String,
      required: true
    }
  })
</script>

<template>
  <span class="soon-badge">
    <span class="soon-badge__dot" aria-hidden="true"></span>
    {{ text }}
  </span>
</template>

<style scoped>
  .soon-badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 5px;
    /* Chap tomonda nuqta bor — shu tomon 2px torroq, matn markazda ko'rinsin */
    padding: 4px 10px 4px 8px;
    border-radius: 9999px;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    line-height: normal;
    letter-spacing: 0.22px;
    white-space: nowrap;
    background-image: linear-gradient(90deg, var(--fig-icon-amber), var(--fig-icon-orange));
    /* Ikki qatlam: pastga tushuvchi issiq soya + chip atrofidagi och halo */
    box-shadow:
      0 2px 8px rgb(242 107 31 / 0.35),
      0 0 0 3px var(--fig-orange-100);
  }

  .soon-badge__dot {
    height: 6px;
    width: 6px;
    flex-shrink: 0;
    border-radius: 9999px;
    background: #fff;
    animation: soon-badge-pulse 1.8s ease-out infinite;
  }

  /* Nuqtadan tarqaladigan halqa — e'tiborni tortadi, lekin joy egallamaydi
     (`box-shadow` layout'ga ta'sir qilmaydi). */
  @keyframes soon-badge-pulse {
    0% {
      box-shadow: 0 0 0 0 rgb(255 255 255 / 0.65);
    }

    70% {
      box-shadow: 0 0 0 6px rgb(255 255 255 / 0);
    }

    100% {
      box-shadow: 0 0 0 0 rgb(255 255 255 / 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .soon-badge__dot {
      animation: none;
    }
  }
</style>
