<script setup>
  import { PeopleSwap20Regular } from '@vicons/fluent'

  const props = defineProps({
    worker: {
      type: Object,
      default: null
    },
    dayIndex: {
      type: Number,
      default: 0
    }
  })
</script>

<template>
  <n-popover v-if="worker?.days?.[dayIndex]?.substitution" trigger="hover" placement="top" :width="260">
    <template #trigger>
      <div
        class="absolute top-0 right-0 z-[1] w-[18px] h-[16px] flex items-center justify-center rounded-bl bg-warning text-white"
      >
        <n-icon size="12"><PeopleSwap20Regular /></n-icon>
      </div>
    </template>
    <div class="text-xs leading-[1.4]">
      <div class="font-semibold mb-1">{{ $t('shiftType.groupView.subTitle') }}</div>
      {{
        worker.days[dayIndex].substitution.role === 'absent'
          ? $t('shiftType.groupView.subAbsentTitle', { name: worker.days[dayIndex].substitution.name })
          : $t('shiftType.groupView.subWorksTitle', { name: worker.days[dayIndex].substitution.name })
      }}
      <span class="text-secondary">
        ({{ worker.days[dayIndex].substitution.start_time }}–{{ worker.days[dayIndex].substitution.end_time }})
      </span>
    </div>
  </n-popover>
  <template v-if="worker?.days?.[dayIndex]?.empty">
    <!--                  Empty box-->
  </template>
  <template v-else-if="worker?.days?.[dayIndex]?.isWorkDay">
    <div class="leading-[1.2] pt-3">{{ worker?.days?.[dayIndex]?.startTime }}</div>
    <div class="leading-[1.2]">{{ worker?.days?.[dayIndex]?.endTime }}</div>
    <div
      class="absolute top-[0] left-[0] w-[16px] h-[16px] bg-secondary/80 text-white text-xs rounded"
    >
      {{ Math.floor(worker?.days?.[dayIndex]?.workTime / 60) }}
    </div>
  </template>
  <template v-else>
    <div
      class="absolute top-[0] left-[0] w-[16px] h-[16px] bg-success/40 text-white text-xs rounded hover:bg-success/50"
    >
      D
    </div>
  </template>
</template>
