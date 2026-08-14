<script setup>
  /**
   * Mobil ilova ko'rinishini ko'rsatish uchun qurilma ramkasi:
   * qora bezel + dynamic island + iOS uslubidagi status bar.
   *
   * Ekran mazmuni default slot orqali beriladi va u to'liq ekranni egallaydi
   * (status bar hamda island uning ustida suzadi — haqiqiy qurilmadagidek).
   */
  defineProps({
    // Ekran (bezel ichidagi qism) o'lchamlari.
    // Standart qiymat — iPhone 17 Pro Max mantiqiy ekrani (440 × 956 pt),
    // 0.727 koeffitsient bilan kichraytirilgan: 320 × 695. Nisbat saqlanadi
    // (440 / 956 ≈ 320 / 695), shuning uchun preview haqiqiy qurilmadagidek
    // cho'ziq bo'lib ko'rinadi.
    width: { type: Number, default: 320 },
    height: { type: Number, default: 695 },
    // Kontent uchun qo'shimcha class (mas. `overflow-y-auto bg-white`)
    screenClass: { type: [String, Array, Object], default: null },
    // Status bar gliflari rangi: to'q kontent ustida 'light', och kontent ustida 'dark'.
    statusBarTheme: { type: String, default: 'light' },
    // Gliflar ostidagi yumshoq qorayish — och/rangli kontent ustida ham o'qilsin.
    statusBarScrim: { type: Boolean, default: true }
  })
</script>

<template>
  <div class="phone-frame" :style="{ width: `${width + 20}px` }">
    <div class="phone-screen" :style="{ width: `${width}px`, height: `${height}px` }">
      <div class="phone-content" :class="screenClass">
        <slot />
      </div>

      <div v-if="statusBarScrim" class="phone-scrim" :class="`phone-scrim--${statusBarTheme}`" />

      <!-- Status bar (iOS: chapda soat, o'ngda tarmoq · Wi-Fi · batareya) -->
      <div class="phone-status" :class="`phone-status--${statusBarTheme}`">
        <span class="phone-time">9:41</span>

        <span class="phone-status-icons">
          <!-- Uyali aloqa -->
          <svg class="phone-cellular" viewBox="0 0 17 12" fill="currentColor">
            <rect x="0" y="8.5" width="3" height="3.5" rx="1" />
            <rect x="4.7" y="6.3" width="3" height="5.7" rx="1" />
            <rect x="9.3" y="3.7" width="3" height="8.3" rx="1" />
            <rect x="14" y="0.6" width="3" height="11.4" rx="1" />
          </svg>

          <!-- Wi-Fi -->
          <svg
            class="phone-wifi"
            viewBox="0 0 16 12"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          >
            <path d="M1.5 4.35a9.6 9.6 0 0 1 13 0" />
            <path d="M4.15 7.05a5.9 5.9 0 0 1 7.7 0" />
            <path d="M6.75 9.6a2.2 2.2 0 0 1 2.5 0" />
          </svg>

          <!-- Batareya -->
          <svg class="phone-battery" viewBox="0 0 25 13" fill="none">
            <rect
              x="0.6"
              y="0.6"
              width="20.8"
              height="11.8"
              rx="3.8"
              stroke="currentColor"
              stroke-opacity="0.4"
              stroke-width="1.2"
            />
            <rect x="2.2" y="2.2" width="14.6" height="8.6" rx="2.4" fill="currentColor" />
            <path
              d="M23 4.6v3.8a2.1 2.1 0 0 0 0-3.8Z"
              fill="currentColor"
              fill-opacity="0.45"
            />
          </svg>
        </span>
      </div>

      <!-- Dynamic island -->
      <div class="phone-island" />
    </div>
  </div>
</template>

<style scoped>
  .phone-frame {
    padding: 10px;
    border-radius: 42px;
    background: #101014;
    box-shadow:
      0 18px 40px -18px rgba(16, 24, 40, 0.45),
      0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  }

  .phone-screen {
    position: relative;
    border-radius: 32px;
    overflow: hidden;
    background: #000;
  }

  .phone-content {
    width: 100%;
    height: 100%;
    /* Ekran ichida brauzer scrollbar'i ko'rinmasin — qurilmada u yo'q. */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .phone-content::-webkit-scrollbar {
    display: none;
  }

  .phone-scrim {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    z-index: 35;
    pointer-events: none;
  }

  .phone-scrim--light {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.28), rgba(0, 0, 0, 0));
  }

  .phone-scrim--dark {
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
  }

  /* iOS status bar: island bilan bir xil vertikal markazda (island 8px + 26px / 2 = 21px). */
  .phone-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 42px;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    pointer-events: none;
  }

  .phone-status--light {
    color: #fff;
  }

  .phone-status--dark {
    color: #000;
  }

  .phone-time {
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: -0.2px;
    font-variant-numeric: tabular-nums;
  }

  .phone-status-icons {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .phone-cellular {
    width: 12px;
    height: 8.5px;
  }

  .phone-wifi {
    width: 12px;
    height: 9px;
  }

  .phone-battery {
    width: 19px;
    height: 10px;
  }

  .phone-island {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    width: 92px;
    height: 26px;
    border-radius: 999px;
    background: #000;
  }
</style>
