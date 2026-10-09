<script setup>
  import { Person16Filled, Person16Regular } from '@vicons/fluent'

  // Kiritilgan xodimlar soni bo'yicha brigadalar hisobi va ularning to'lishi.
  const props = defineProps({
    size: { type: Number, required: true },
    workers: { type: Number, default: 0 }
  })

  const MAX_CREWS_SHOWN = 10
  const MAX_ICONS = 6

  const crews = computed(() => Math.ceil((props.workers || 0) / props.size))
  const empty = computed(() => (props.workers % props.size ? props.size - (props.workers % props.size) : 0))
  const shown = computed(() =>
    Array.from({ length: Math.min(crews.value, MAX_CREWS_SHOWN) }, (_, i) => {
      const last = i === crews.value - 1
      return { filled: last && empty.value ? props.size - empty.value : props.size }
    })
  )
  const icons = computed(() => Math.min(props.size, MAX_ICONS))
</script>

<template>
  <div class="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden text-sm">
    <div v-if="workers" class="px-3 py-2.5">
      <div class="flex flex-wrap items-center gap-2 font-medium">
        <span class="px-2 py-0.5 rounded-md bg-surface-ground">{{ $t('shiftType.generate.workersN', { n: workers }) }}</span>
        <span class="text-secondary">÷</span>
        <span class="px-2 py-0.5 rounded-md bg-surface-ground">{{ $t('shiftType.groupView.crewSize', { n: size }) }}</span>
        <span class="text-secondary">=</span>
        <span class="px-2 py-0.5 rounded-md bg-primary text-white">{{ $t('shiftType.generate.crewsN', { n: crews }) }}</span>
      </div>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <span
          v-for="(c, i) in shown"
          :key="i"
          class="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-md border"
          :class="c.filled < size ? 'border-warning/50 bg-warning/5' : 'border-surface-line bg-surface-section'"
          :title="$t('shiftType.generate.crewN', { n: i + 1 })"
        >
          <span class="text-[10px] text-secondary mr-0.5">{{ i + 1 }}</span>
          <template v-for="p in icons" :key="p">
            <n-icon v-if="p <= c.filled" size="12" class="text-primary"><Person16Filled /></n-icon>
            <n-icon v-else size="12" class="text-warning"><Person16Regular /></n-icon>
          </template>
        </span>
        <span v-if="crews > MAX_CREWS_SHOWN" class="self-center text-xs text-secondary">
          {{ $t('shiftType.generate.moreCrews', { n: crews - MAX_CREWS_SHOWN }) }}
        </span>
      </div>
      <div v-if="empty" class="mt-2 flex items-center gap-1.5 text-xs text-warning">
        <n-icon size="14"><Person16Regular /></n-icon>
        {{ $t('shiftType.generate.emptyInLast', { n: empty }) }}
      </div>
    </div>
  </div>
</template>
