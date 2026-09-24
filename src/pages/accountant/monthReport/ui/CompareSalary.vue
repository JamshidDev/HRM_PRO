<script setup>
  import { useMonthReportStore } from '@/store/modules/index.js'
  import { UIYearMonth } from '@/components/index.js'
  import { useAppSetting, Utils } from '@/utils/index.js'
  import {
    ArrowSwap20Filled,
    ArrowUp16Filled,
    ArrowDown16Filled,
    Subtract16Filled,
    ChevronLeft12Filled,
    ChevronRight12Filled
  } from '@vicons/fluent'

  const store = useMonthReportStore()
  const photoUrl = computed(() => store.workerPhotoUrl || useAppSetting.noAvailableImage)

  const leftItem = computed(() => store.compareLeft.list[store.compareLeft.index] || null)
  const rightItem = computed(() => store.compareRight.list[store.compareRight.index] || null)
  const worker = computed(
    () => rightItem.value?.worker || leftItem.value?.worker || store.cashedWorkerData
  )

  const loading = computed(() => store.compareLeft.loading || store.compareRight.loading)
  const isEmpty = computed(() => !leftItem.value && !rightItem.value && !loading.value)

  const monthLabel = (side) => {
    const s = side === 'left' ? store.compareLeft : store.compareRight
    if (!s.year || !s.month) return '-:-'
    return `${s.year}, ${Utils.monthList.find((m) => m.id === Number(s.month))?.name || ''}`
  }

  // Backend summani "10 330 942,00" ko'rinishida (bo'sh joy + vergul) qaytaradi —
  // farqni hisoblash uchun songa aylantiramiz.
  const toNum = (v) => {
    if (v === null || v === undefined || v === '') return null
    if (typeof v === 'number') return v
    const n = Number(String(v).replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }

  const fmt = (n) => {
    if (n === null || n === undefined) return '—'
    return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const fmtSigned = (n) => (n > 0 ? `+${fmt(n)}` : fmt(n))

  // Satrlar shifr bo'yicha qatorlanadi (farq shu orqali hisoblanadi), lekin har
  // bir oy o'z shifri va o'z to'lov nomini ko'rsatadi — bitta shifrning nomi
  // oydan oyga o'zgarishi mumkin.
  const mergeRows = (key) => {
    const map = new Map()
    const put = (item, side) => {
      ;(item?.[key] || []).forEach((row) => {
        const code = String(row.code)
        if (!map.has(code)) map.set(code, { code, a: null, b: null })
        map.get(code)[side] = { code: row.code, type: row.type, amount: row.amount }
      })
    }
    put(leftItem.value, 'a')
    put(rightItem.value, 'b')
    return [...map.values()].sort((x, y) => x.code.localeCompare(y.code))
  }

  // Bo'sh jadval ko'rsatilmaydi — shu sababli filtrlash shu yerda.
  const tables = computed(() =>
    [
      { key: 'in', title: 'monthReport.compare.inTable', rows: mergeRows('in') },
      { key: 'out', title: 'monthReport.compare.outTable', rows: mergeRows('out') }
    ].filter((t) => t.rows.length)
  )

  const diff = (a, b) => (toNum(b) ?? 0) - (toNum(a) ?? 0)
  // Ikkala oyda ham summa bo'lmasa, "0,00" o'rniga chiziqcha.
  const diffText = (a, b) => (toNum(a) === null && toNum(b) === null ? '—' : fmtSigned(diff(a, b)))
  const diffClass = (d) => (d > 0 ? 'text-success' : d < 0 ? 'text-danger' : 'text-textColor3')
  const onlyOneSide = (row) => !row.a || !row.b

  const summary = computed(() => [
    {
      key: 'in',
      label: 'monthReport.in.total',
      a: leftItem.value?.in_total,
      b: rightItem.value?.in_total
    },
    {
      key: 'out',
      label: 'monthReport.in.out_total',
      a: leftItem.value?.out_total,
      b: rightItem.value?.out_total
    },
    {
      key: 'net',
      label: 'monthReport.view.net_salary',
      a: leftItem.value?.in_card?.amount,
      b: rightItem.value?.in_card?.amount
    }
  ])

  const step = (side, delta) => {
    const s = side === 'left' ? store.compareLeft : store.compareRight
    const next = s.index + delta
    if (next >= 0 && next < s.list.length) s.index = next
  }
</script>

<template>
  <div class="h-[calc(100vh-160px)] overflow-auto">
    <n-spin class="w-full min-h-[560px]" :show="loading">
      <!-- Oy tanlash paneli -->
      <div class="grid grid-cols-12 gap-3 items-end border border-surface-line rounded-lg p-3 mb-4">
        <div class="col-span-12 md:col-span-5">
          <div class="text-xs text-textColor3 mb-1">{{ $t('monthReport.compare.first') }}</div>
          <div class="flex items-center gap-2">
            <div class="flex-1 min-w-0">
              <UIYearMonth
                v-model:year="store.compareLeft.year"
                v-model:month="store.compareLeft.month"
                :clearable="false"
                @change="store._onCompareMonth('left')"
              />
            </div>
            <div v-if="store.compareLeft.list.length > 1" class="flex items-center gap-1 shrink-0">
              <n-button size="tiny" quaternary circle @click="step('left', -1)">
                <template #icon>
                  <n-icon><ChevronLeft12Filled /></n-icon>
                </template>
              </n-button>
              <span class="text-xs text-textColor3">
                {{ store.compareLeft.index + 1 }}/{{ store.compareLeft.list.length }}
              </span>
              <n-button size="tiny" quaternary circle @click="step('left', 1)">
                <template #icon>
                  <n-icon><ChevronRight12Filled /></n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
        <div class="col-span-12 md:col-span-2 flex justify-center pb-1">
          <n-icon size="22" class="text-primary">
            <ArrowSwap20Filled />
          </n-icon>
        </div>
        <div class="col-span-12 md:col-span-5">
          <div class="text-xs text-textColor3 mb-1">{{ $t('monthReport.compare.second') }}</div>
          <div class="flex items-center gap-2">
            <div class="flex-1 min-w-0">
              <UIYearMonth
                v-model:year="store.compareRight.year"
                v-model:month="store.compareRight.month"
                :clearable="false"
                @change="store._onCompareMonth('right')"
              />
            </div>
            <div v-if="store.compareRight.list.length > 1" class="flex items-center gap-1 shrink-0">
              <n-button size="tiny" quaternary circle @click="step('right', -1)">
                <template #icon>
                  <n-icon><ChevronLeft12Filled /></n-icon>
                </template>
              </n-button>
              <span class="text-xs text-textColor3">
                {{ store.compareRight.index + 1 }}/{{ store.compareRight.list.length }}
              </span>
              <n-button size="tiny" quaternary circle @click="step('right', 1)">
                <template #icon>
                  <n-icon><ChevronRight12Filled /></n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Xodim -->
      <div v-if="worker" class="flex border border-surface-line rounded-lg p-2 mb-4">
        <div class="w-[110px] shrink-0 p-1">
          <img
            class="w-full rounded-lg border border-surface-line"
            :src="photoUrl"
            @error="Utils.onImgError"
            alt="no photo"
          />
        </div>
        <div class="grid grid-cols-12 px-2 pt-1 w-[calc(100%-110px)]">
          <div class="col-span-12 font-semibold text-lg mb-1">{{ worker?.full_name }}</div>
          <div class="col-span-12 !text-wrap leading-[1.2]">
            <span class="text-primary">{{ $t('content.organization') }}: </span>
            {{ worker?.organization }}
          </div>
          <div class="col-span-12">
            <span class="text-primary">{{ $t('content.position') }}: </span>
            {{ worker?.position }}
          </div>
          <div class="col-span-12 md:col-span-6 mt-1">
            <span class="text-primary">{{ $t('monthReport.view.main_salary') }}: </span>
            <span class="tnum">{{ leftItem?.worker?.main_salary ?? '-:-' }}</span>
            <span class="text-textColor3 mx-1">→</span>
            <span class="tnum font-semibold">{{ rightItem?.worker?.main_salary ?? '-:-' }}</span>
          </div>
          <div class="col-span-12 md:col-span-6 mt-1">
            <span class="text-primary">{{ $t('monthReport.view.work_time') }}: </span>
            <span class="tnum">{{ leftItem?.worker?.work_time ?? '-:-' }}</span>
            <span class="text-textColor3 mx-1">→</span>
            <span class="tnum font-semibold">
              {{ rightItem?.worker?.work_time ?? '-:-' }} {{ $t('content.hour') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Umumiy ko'rsatkichlar -->
      <div v-if="!isEmpty" class="grid grid-cols-12 gap-3 mb-4">
        <div
          v-for="card in summary"
          :key="card.key"
          class="col-span-12 md:col-span-4 rounded-lg border border-surface-line p-3"
          :class="card.key === 'net' && 'bg-primary/5 border-primary/20'"
        >
          <div class="text-xs text-textColor3 mb-2">{{ $t(card.label) }}</div>
          <div class="flex items-baseline justify-between gap-2">
            <span class="tnum text-textColor1">{{ card.a ?? '—' }}</span>
            <span class="text-textColor3">→</span>
            <span class="tnum font-semibold">{{ card.b ?? '—' }}</span>
          </div>
          <div class="mt-2 flex items-center gap-1" :class="diffClass(diff(card.a, card.b))">
            <n-icon size="14">
              <ArrowUp16Filled v-if="diff(card.a, card.b) > 0" />
              <ArrowDown16Filled v-else-if="diff(card.a, card.b) < 0" />
              <Subtract16Filled v-else />
            </n-icon>
            <b class="tnum text-sm">{{ diffText(card.a, card.b) }}</b>
          </div>
        </div>
      </div>

      <!-- Hisoblangan / ushlangan to'lovlar. Har bir oy o'z shifri va o'z to'lov
           nomi bilan ko'rsatiladi: bir shifr ostidagi nom oyma-oy o'zgarishi mumkin. -->
      <div v-for="table in tables" :key="table.key" class="mb-4 overflow-x-auto">
        <div class="text-sm font-semibold mb-1">{{ $t(table.title) }}</div>
        <n-table :single-line="false" size="small" class="min-w-[1000px]">
          <thead>
            <tr>
              <th colspan="3" class="text-center! bg-surface-ground">{{ monthLabel('left') }}</th>
              <th colspan="3" class="text-center! bg-surface-ground border-l! border-surface-line!">
                {{ monthLabel('right') }}
              </th>
              <th
                rowspan="2"
                class="w-[140px] text-right! align-middle! border-l! border-surface-line!"
              >
                {{ $t('monthReport.compare.difference') }}
              </th>
            </tr>
            <tr>
              <th class="w-[100px]">{{ $t('monthReport.in.code') }}</th>
              <th>{{ $t('monthReport.in.type') }}</th>
              <th class="w-[140px] text-right!">{{ $t('monthReport.in.amount') }}</th>
              <th class="w-[100px] border-l! border-surface-line!">
                {{ $t('monthReport.in.code') }}
              </th>
              <th>{{ $t('monthReport.in.type') }}</th>
              <th class="w-[140px] text-right!">{{ $t('monthReport.in.amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in table.rows"
              :key="row.code"
              :class="onlyOneSide(row) && 'bg-warning/5'"
            >
              <td class="font-semibold py-1!">{{ row.a?.code ?? '—' }}</td>
              <td class="py-1!">{{ row.a?.type ?? '—' }}</td>
              <td class="py-1! text-right tnum">{{ row.a?.amount ?? '—' }}</td>
              <td class="font-semibold py-1! border-l! border-surface-line!">
                {{ row.b?.code ?? '—' }}
              </td>
              <td class="py-1!">{{ row.b?.type ?? '—' }}</td>
              <td class="py-1! text-right tnum">{{ row.b?.amount ?? '—' }}</td>
              <td
                class="py-1! text-right tnum font-semibold border-l! border-surface-line!"
                :class="diffClass(diff(row.a?.amount, row.b?.amount))"
              >
                {{ diffText(row.a?.amount, row.b?.amount) }}
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>

      <p v-if="isEmpty" class="text-center pt-10 text-surface/20 text-lg">
        {{ $t('content.no-data') }}
      </p>
      <div v-else-if="!leftItem || !rightItem" class="text-center text-textColor3 text-sm pb-4">
        {{ $t('monthReport.compare.oneSideEmpty') }}
      </div>
    </n-spin>
  </div>
</template>
