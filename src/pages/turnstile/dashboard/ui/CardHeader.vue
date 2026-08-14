<script setup>
  const props = defineProps({
    icon: Object,
    title: String,
    subtitle: String,
    // Chip foni: maketdagi tint tokenlari
    tint: {
      type: String,
      default: 'indigo'
    },
    // Qurilmalar kartasida tavsif 10px (maketda shunday)
    smallSubtitle: Boolean
  })

  const tintClass = computed(
    () =>
      ({
        green: 'bg-fig-green-100',
        orange: 'bg-fig-orange-100',
        yellow: 'bg-fig-yellow-100',
        red: 'bg-fig-red-100',
        blue: 'bg-fig-blue-100',
        indigo: 'bg-fig-indigo-100',
        lime: 'bg-fig-lime-100',
        teal: 'bg-fig-teal-100'
      })[props.tint] || 'bg-fig-indigo-100'
  )
</script>

<template>
  <div class="flex items-center gap-1 pl-2 pr-1 py-3 w-full">
    <!-- Maketda: 28px chip = 4px padding + 20px ikonka ramkasi. Ikonka SVG'si
         o'zining tabiiy o'lchamida (glyph) ramka markazida turadi — cho'zilmaydi. -->
    <div v-if="icon" class="shrink-0 rounded-lg p-1" :class="tintClass">
      <span class="w-5 h-5 flex items-center justify-center">
        <component :is="icon" />
      </span>
    </div>
    <div class="flex-1 min-w-0 flex flex-col justify-center">
      <p class="text-[14px] leading-[18px] font-medium text-fig-text-primary truncate">
        {{ title }}
      </p>
      <p
        v-if="subtitle"
        class="text-[#74788d] truncate"
        :class="smallSubtitle ? 'text-[10px] leading-[12px]' : 'text-[12px] leading-[14.4px]'"
      >
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
