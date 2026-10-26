<script setup>
  // Sana maydoni ostidagi tezkor tanlov: «Bugundan» / «Oy boshidan».
  defineProps({
    current: { type: String, default: null },
    today: { type: String, default: null },
    todayAllowed: { type: Boolean, default: false },
    minDay: { type: String, default: null }
  })
  const emit = defineEmits(['pick'])
</script>

<template>
  <div class="flex gap-1.5">
    <n-button
      v-if="todayAllowed"
      size="tiny"
      round
      secondary
      :type="current === today ? 'primary' : 'default'"
      @click="emit('pick', today)"
    >
      {{ $t('shiftType.groupView.regenToday') }}
    </n-button>
    <n-button
      size="tiny"
      round
      secondary
      :type="current === minDay ? 'primary' : 'default'"
      @click="emit('pick', minDay)"
    >
      {{ $t('shiftType.groupView.regenMonthStart') }}
    </n-button>
  </div>
</template>
