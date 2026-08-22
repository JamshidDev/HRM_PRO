<script setup>
  /**
   * Figma v3 · Tab 2 "Yaqinlashayotgan hodisalar — vaqt o'qi" (node 2959:59323).
   *
   * Gorizontal o'q bo'ylab markerlar; har bir markerdan chiqqan callout blok
   * navbatma-navbat o'qning ustida va ostida turadi, kun yozuvi esa markerning
   * yonida qoladi.
   *
   * Markerlar teng masofada joylashadi (maketda ham shunday) — kun soni
   * o'lchovli o'q sifatida emas, tartiblangan bosqich sifatida ko'rsatiladi.
   */
  const props = defineProps({
    // [{ days, title, count, token }]
    items: {
      type: Array,
      default: () => []
    }
  })

  const points = computed(() => {
    const count = props.items.length
    return props.items.map((item, idx) => ({
      ...item,
      // chetlarda callout kesilmasligi uchun 6 %…94 % oralig'ida
      left: count > 1 ? 6 + (idx * 88) / (count - 1) : 50,
      above: idx % 2 === 0
    }))
  })
</script>

<template>
  <div class="relative h-[190px] w-full">
    <!-- o'q -->
    <span class="absolute top-1/2 left-0 h-px w-full bg-fig-br-secondary"></span>

    <div
      v-for="(point, idx) in points"
      :key="idx"
      class="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      :style="{ left: `${point.left}%` }"
    >
      <!-- Yuqoridagi callout: markerdan chiqqan poya bilan birga o'q ustiga
           chiqariladi, shu sababli blok butunlay yuqoriga ko'chiriladi. -->
      <div v-if="point.above" class="absolute bottom-full flex flex-col items-center">
        <div class="w-max max-w-[180px] rounded-lg bg-fig-bg-tertiary px-3 py-2">
          <p class="text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary">
            {{ point.count }}
          </p>
          <p class="text-[12px] leading-4 text-fig-text-secondary">{{ point.title }}</p>
        </div>
        <span class="h-4 w-[2px]" :style="{ backgroundColor: `var(${point.token})` }"></span>
      </div>

      <!-- marker -->
      <span
        class="h-2.5 w-2.5 shrink-0 rounded-full"
        :style="{ backgroundColor: `var(${point.token})` }"
      ></span>

      <!-- Pastdagi callout -->
      <div v-if="!point.above" class="absolute top-full flex flex-col items-center">
        <span class="h-4 w-[2px]" :style="{ backgroundColor: `var(${point.token})` }"></span>
        <div class="w-max max-w-[180px] rounded-lg bg-fig-bg-tertiary px-3 py-2">
          <p class="text-[12px] leading-4 font-semibold whitespace-nowrap text-fig-text-primary">
            {{ point.count }}
          </p>
          <p class="text-[12px] leading-4 text-fig-text-secondary">{{ point.title }}</p>
        </div>
      </div>

      <!-- kun yozuvi: callout qarama-qarshi tomonda, o'qqa yaqin turadi -->
      <p
        class="absolute text-[12px] leading-4 whitespace-nowrap text-fig-text-tertiary"
        :class="point.above ? 'top-3' : 'bottom-3'"
      >
        {{ point.days }}
      </p>
    </div>
  </div>
</template>
