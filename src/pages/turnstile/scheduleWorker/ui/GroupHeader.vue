<script setup>
  import { useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { departmentCrews, isRotating, navbatSummary, patternOf } from './navbat.js'

  const store = useScheduleGroupWorkerStore()
  const DAILY_TYPE = 2

  const fmt = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('.') : '—')

  const pattern = computed(() => patternOf(store.shiftType))
  const rotating = computed(() => isRotating(store.shiftType))

  // Kunlik turda naqsh hafta kunlari (1=Du … 7=Ya), aylanmada sikl kunlari.
  const weekKeys = [1, 2, 3, 4, 5, 6, 0]
  const chips = computed(() =>
    (store.shiftType?.days ?? []).map((d, i) => ({
      label:
        store.shiftType?.type?.id === DAILY_TYPE
          ? store.shortNameOfWeek[weekKeys[i]]
          : `${i + 1}`,
      work: !!d.work_status,
      time: d.work_status ? `${d.start_time ?? ''}–${d.end_time ?? ''}` : null
    }))
  )

  const crews = computed(() => (rotating.value ? departmentCrews(store.list, pattern.value) : []))

  const summary = computed(() =>
    rotating.value ? navbatSummary(store.list, pattern.value) : null
  )
</script>

<template>
  <div class="rounded-xl border border-surface-line bg-surface-section p-4 flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
      <div class="min-w-0">
        <div class="font-semibold text-base leading-tight line-clamp-1">
          {{ store.shiftType?.name || $t('shiftType.form.groupWorkers') }}
        </div>
        <n-tag v-if="store.shiftType?.type?.name" size="small" round class="mt-1">
          {{ store.shiftType.type.name }}
        </n-tag>
      </div>
      <div class="text-sm">
        <div class="text-secondary text-xs">{{ $t('shiftType.groupView.period') }}</div>
        <div class="font-medium">{{ fmt(store.params.startDate) }} – {{ fmt(store.params.endDate) }}</div>
      </div>
      <div class="text-sm">
        <div class="text-secondary text-xs">{{ $t('shiftType.groupView.workers') }}</div>
        <div class="font-medium">{{ store.totalItems }}</div>
      </div>
    </div>

    <div v-if="chips.length" class="flex flex-wrap items-center gap-2 text-xs">
      <span class="text-secondary">
        {{ $t('shiftType.groupView.pattern') }}
        <template v-if="rotating">({{ $t('shiftType.groupView.cycle', { n: chips.length }) }})</template>:
      </span>
      <span
        v-for="(c, i) in chips"
        :key="i"
        class="px-2 py-1 rounded-md border"
        :class="c.work ? 'border-primary/30 bg-primary/5' : 'border-surface-line text-secondary'"
      >
        <b class="mr-1">{{ c.label }}</b>{{ c.work ? c.time : $t('shiftType.groupView.rest') }}
      </span>
    </div>

    <div v-if="summary && store.list.length" class="flex flex-wrap items-center gap-2 text-xs">
      <n-tooltip>
        <template #trigger>
          <span class="text-secondary cursor-help">{{ $t('shiftType.groupView.navbatTitle') }}:</span>
        </template>
        {{ $t('shiftType.groupView.navbatHint') }}
      </n-tooltip>
      <span
        v-for="(c, i) in summary.counts"
        :key="i"
        class="px-2 py-1 rounded-md border border-surface-line"
      >
        {{ $t('shiftType.groupView.navbat', { n: i + 1 }) }}: <b>{{ c }}</b>
      </span>
      <n-tag v-if="summary.empty" size="small" type="warning" round>
        {{ $t('shiftType.groupView.emptySlots', { n: summary.empty }) }}
      </n-tag>
      <n-tag v-else size="small" type="success" round>{{ $t('shiftType.groupView.allFilled') }}</n-tag>
      <span v-if="summary.unknown" class="text-secondary">
        · {{ $t('shiftType.groupView.unknownNavbat') }}: {{ summary.unknown }}
      </span>
    </div>

    <n-collapse v-if="crews.length > 1" class="text-xs">
      <n-collapse-item :title="$t('shiftType.groupView.byDepartment') + ` (${crews.length})`" name="d">
        <div class="overflow-auto max-h-[260px]">
          <table class="w-full text-xs">
            <thead class="text-secondary sticky top-0 bg-surface-section">
              <tr>
                <th class="text-left font-medium py-1 pr-3">{{ $t('shiftType.groupView.department') }}</th>
                <th v-for="(_, i) in pattern" :key="i" class="font-medium px-2">
                  {{ $t('shiftType.groupView.navbat', { n: i + 1 }) }}
                </th>
                <th class="font-medium px-2">{{ $t('shiftType.groupView.fullCrews') }}</th>
                <th class="font-medium px-2">{{ $t('shiftType.groupView.missing') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in crews" :key="c.name" class="border-t border-surface-line">
                <td class="py-1 pr-3 line-clamp-1">{{ c.name }}</td>
                <td
                  v-for="(v, i) in c.counts"
                  :key="i"
                  class="text-center px-2"
                  :class="{ 'text-warning font-semibold': v < Math.max(...c.counts) }"
                >
                  {{ v }}
                </td>
                <td class="text-center px-2 font-medium">{{ c.full }}</td>
                <td class="text-center px-2">
                  <n-tag v-if="c.missing" size="tiny" type="warning" round>{{ c.missing }}</n-tag>
                  <span v-else class="text-success">✓</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>
