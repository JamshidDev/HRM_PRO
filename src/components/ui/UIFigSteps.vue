<script setup>
  import icons from '@/assets/icons'

  /**
   * Figma "Step" + "Step Line" (node 3132:62016) — gorizontal progress indikator.
   *
   * Qadamlar sahifada navigatsiya qilmaydi: bloklar bitta scrollda turadi, bu yerda
   * faqat qaysi blok to'ldirilgani ko'rsatiladi.
   *
   * Doira 32x32; bajarilgan va joriy qadam ko'k gradient, qolgani chegara bilan.
   */
  defineProps({
    // [{ key, label }]
    steps: {
      type: Array,
      required: true
    },
    // 1 dan boshlanadi
    current: {
      type: Number,
      default: 1
    },
    // bajarilgan qadamlar tartib raqamlari (1 dan)
    completed: {
      type: Array,
      default: () => []
    }
  })
</script>

<template>
  <div class="fig-steps">
    <template v-for="(step, idx) in steps" :key="step.key">
      <!-- Ulagich chiziq: oldingi qadam bajarilgan bo'lsa ko'karadi -->
      <span
        v-if="idx > 0"
        class="fig-steps__line"
        :class="completed.includes(idx) && 'fig-steps__line--done'"
      />

      <div class="fig-steps__item">
        <div
          class="fig-steps__badge"
          :class="[
            completed.includes(idx + 1) && 'fig-steps__badge--done',
            current === idx + 1 && !completed.includes(idx + 1) && 'fig-steps__badge--active'
          ]"
        >
          <n-icon v-if="completed.includes(idx + 1)" :size="16">
            <component :is="icons.figBadgeCheck" />
          </n-icon>
          <span v-else>{{ idx + 1 }}</span>
        </div>

        <span class="fig-steps__label" :class="current === idx + 1 && 'fig-steps__label--active'">
          {{ step.label }}
        </span>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  .fig-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 8px 0;
  }

  .fig-steps__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    gap: 4px;
  }

  .fig-steps__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border: 1px solid var(--fig-neutral-300);
    border-radius: 9999px;
    color: var(--fig-text-tertiary);
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
  }

  .fig-steps__badge--done,
  .fig-steps__badge--active {
    border-color: transparent;
    background: linear-gradient(180deg, #0088ff 0%, #0866b9 100%);
    color: #ffffff;
  }

  .fig-steps__badge--active {
    filter: drop-shadow(0 4px 16px rgba(0, 136, 255, 0.24));
  }

  .fig-steps__label {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--fig-text-secondary);
    white-space: nowrap;
  }

  .fig-steps__label--active {
    font-weight: 500;
    line-height: 18px;
    color: var(--fig-text-primary);
  }

  .fig-steps__line {
    width: 80px;
    height: 2px;
    flex-shrink: 0;
    border-radius: 9999px;
    background: var(--fig-bg-tertiary);
  }

  .fig-steps__line--done {
    background: var(--fig-bg-brand-fill);
  }

  // Mobilda qadamlar bir qatorda qolib, kerak bo'lsa gorizontal scroll qilinadi
  @media (max-width: 768px) {
    .fig-steps {
      justify-content: flex-start;
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .fig-steps__line {
      width: 32px;
    }

    .fig-steps__label {
      font-size: 12px;
      line-height: 16px;
    }
  }
</style>
