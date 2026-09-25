<script setup>
  import dayjs from 'dayjs'
  import { ShieldCheckmark16Filled, ChevronDown16Regular } from '@vicons/fluent'
  import { UIUserGroup } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import PdfFileIcon from '@/assets/icons/pdfFileIcon.svg'
  import ImageFileIcon from '@/assets/icons/figImageSquare.svg'
  import { eventMeta } from '../utils/eventMeta.js'
  import { EVENT, STATUS } from '../utils/approvalHistory.js'

  const props = defineProps({
    confirmations: { type: Array, default: () => [] },
    bySigner: { type: Array, default: () => [] },
    // Hujjat darajasidagi hodisalar (fayl qo'shildi/o'chirildi) — `document_events`.
    documentEvents: { type: Array, default: () => [] }
  })

  // Bir vaqtda (bir daqiqada) ko'pchilikka bo'lgan yuborish — bitta qator bo'lib birlashadi.
  const GROUPABLE = [EVENT.sent, EVENT.resent]

  const shortName = (w) =>
    [w?.last_name, [w?.first_name?.[0], w?.middle_name?.[0]].filter(Boolean).join('.')]
      .filter(Boolean)
      .join(' ') + (w?.first_name ? '.' : '')

  const summary = computed(() => {
    const ids = props.confirmations.map((c) => c.status?.id)
    return {
      approved: ids.filter((id) => id === STATUS.success).length,
      rejected: ids.filter((id) => id === STATUS.rejected).length,
      pending: ids.filter((id) => id !== STATUS.success && id !== STATUS.rejected).length
    }
  })

  const groups = computed(() => {
    const flat = props.bySigner.flatMap((events, idx) =>
      events.map((ev) => ({ ...ev, signer: props.confirmations[idx] }))
    )
    // Fayl hodisalari: aktyor imzolovchi o'rnida, fayl nomi alohida.
    for (const ev of props.documentEvents) {
      flat.push({
        type: ev.type,
        date: dayjs(ev.date),
        file: ev.name,
        signer: { worker: ev.actor, type: null }
      })
    }
    flat.sort((a, b) => b.date.valueOf() - a.date.valueOf())

    // Qatorlar: birlashgan yuborishlar + yakka harakatlar.
    const rows = []
    for (const ev of flat) {
      const last = rows[rows.length - 1]
      if (
        GROUPABLE.includes(ev.type) &&
        last?.type === ev.type &&
        last.date.format('YYYY-MM-DD HH:mm') === ev.date.format('YYYY-MM-DD HH:mm')
      ) {
        last.signers.push(ev.signer)
        continue
      }
      rows.push({ ...ev, signers: [ev.signer] })
    }

    const map = new Map()
    rows.forEach((row) => {
      const key = row.date.format('YYYY-MM-DD')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(row)
    })
    return [...map.entries()].map(([key, items]) => ({ key, items }))
  })

  const dayLabel = (key) => {
    const d = dayjs(key)
    if (d.isSame(dayjs(), 'day')) return 'content.today'
    if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return 'content.yesterday'
    return null
  }

  const roleLabel = (type) => `documentPage.signature.approval.roles.${type || 's'}`

  const expanded = ref(new Set())
  const rowId = (row) => `${row.type}-${row.date.valueOf()}-${row.file || ''}`
  const isImage = (name) => /\.(png|jpe?g)$/i.test(name || '')
  const toggle = (id) => {
    const next = new Set(expanded.value)
    next.has(id) ? next.delete(id) : next.add(id)
    expanded.value = next
  }

  const avatars = (signers) =>
    signers.map((s) => ({
      photo: s?.worker?.photo || Utils.noAvailableImage,
      fullName: [s?.worker?.last_name, s?.worker?.first_name].filter(Boolean).join(' ')
    }))

  const SUMMARY_TONES = {
    approved: 'bg-fig-chip-green text-fig-chip-green-text',
    rejected: 'bg-fig-red-50 text-fig-text-red',
    pending: 'bg-fig-bg-disable text-fig-text-tertiary'
  }
</script>

<template>
  <div>
    <!-- Yig'ma: tasdiqlagan / rad etgan / kutilmoqda -->
    <div v-if="confirmations.length" class="grid grid-cols-3 gap-1.5 mb-3">
      <div
        v-for="(tone, key) in SUMMARY_TONES"
        :key="key"
        class="rounded-lg px-2 py-1.5 text-center"
        :class="tone"
      >
        <div class="text-sm font-semibold tabular-nums leading-tight">{{ summary[key] }}</div>
        <div class="text-[10px] leading-tight truncate">
          {{ $t(`documentPage.signature.approval.summary.${key}`) }}
        </div>
      </div>
    </div>

    <div v-if="!groups.length" class="text-sm text-textColor3 text-center py-8">
      {{ $t('documentPage.signature.approval.noHistory') }}
    </div>

    <div v-for="group in groups" :key="group.key" class="mb-3">
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-[11px] font-semibold text-textColor2 tabular-nums">
          {{
            dayLabel(group.key) ? $t(dayLabel(group.key)) : dayjs(group.key).format('DD.MM.YYYY')
          }}
        </span>
        <div class="flex-1 h-px bg-surface-line"></div>
      </div>

      <div v-for="(row, i) in group.items" :key="rowId(row)" class="relative flex gap-2.5">
        <!-- Lenta chizig'i -->
        <div
          v-if="i < group.items.length - 1"
          class="absolute left-[14px] top-8 bottom-0 w-px bg-surface-line"
        ></div>

        <!-- Bir kishi — avatar + holat belgisi; guruh — harakat belgisi -->
        <div class="relative shrink-0 w-7 h-7 mt-0.5">
          <template v-if="row.signers.length === 1">
            <n-avatar
              round
              :size="28"
              :src="row.signers[0]?.worker?.photo || Utils.noAvailableImage"
              :fallback-src="Utils.noAvailableImage"
            />
            <span
              class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-surface-section"
              :class="eventMeta[row.type]?.dot"
            >
              <n-icon size="10"><component :is="eventMeta[row.type]?.icon" /></n-icon>
            </span>
          </template>
          <span
            v-else
            class="w-7 h-7 rounded-full flex items-center justify-center"
            :class="eventMeta[row.type]?.dot"
          >
            <n-icon size="14"><component :is="eventMeta[row.type]?.icon" /></n-icon>
          </span>
        </div>

        <div class="min-w-0 flex-1 pb-3">
          <!-- Bir kishi: «Familiya I.O. · Tasdiqladi» -->
          <template v-if="row.signers.length === 1">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 text-xs leading-snug">
                <span class="font-semibold text-textColor0">
                  {{ shortName(row.signers[0]?.worker) }}
                </span>
                <span class="ml-1 font-medium" :class="eventMeta[row.type]?.text">
                  {{ $t(eventMeta[row.type]?.action) }}
                </span>
              </div>
              <span class="text-[11px] tabular-nums text-textColor3 shrink-0">
                {{ row.date.format('HH:mm') }}
              </span>
            </div>
            <div v-if="row.file" class="mt-1 min-w-0">
              <span
                class="inline-flex max-w-full items-center gap-1 rounded-md border border-surface-line bg-surface-ground px-1.5 py-0.5 text-[11px] text-textColor1"
              >
                <n-icon
                  size="12"
                  :class="isImage(row.file) ? 'text-fig-chip-indigo-text' : 'text-fig-text-red'"
                >
                  <component :is="isImage(row.file) ? ImageFileIcon : PdfFileIcon" />
                </n-icon>
                <n-ellipsis class="min-w-0" :tooltip="{ style: { maxWidth: '280px' } }">
                  {{ row.file }}
                </n-ellipsis>
              </span>
            </div>
            <div v-else class="flex items-center gap-1.5 mt-0.5 min-w-0">
              <span
                class="shrink-0 text-[10px] font-medium rounded px-1.5 py-px bg-surface-ground text-textColor2"
              >
                {{ $t(roleLabel(row.signers[0]?.type)) }}
              </span>
              <n-ellipsis
                v-if="row.signers[0]?.type !== 'w' && row.signers[0]?.position"
                class="text-[11px] text-textColor3 min-w-0"
                :tooltip="{ style: { maxWidth: '280px' } }"
              >
                {{ row.signers[0].position }}
              </n-ellipsis>
            </div>
          </template>

          <!-- Guruh: «4 kishiga yuborildi» + avatarlar; bosilsa ro'yxat -->
          <template v-else>
            <button
              type="button"
              class="w-full flex items-center justify-between gap-2 text-left"
              @click="toggle(rowId(row))"
            >
              <span class="text-xs font-semibold text-textColor0 leading-snug">
                {{
                  $t(`documentPage.signature.approval.groups.${row.type}`, {
                    count: row.signers.length
                  })
                }}
              </span>
              <span class="flex items-center gap-1 shrink-0">
                <span class="text-[11px] tabular-nums text-textColor3">
                  {{ row.date.format('HH:mm') }}
                </span>
                <n-icon
                  size="14"
                  class="text-textColor3 transition-transform"
                  :class="expanded.has(rowId(row)) && 'rotate-180'"
                >
                  <ChevronDown16Regular />
                </n-icon>
              </span>
            </button>
            <UIUserGroup
              v-if="!expanded.has(rowId(row))"
              class="mt-1"
              :data="avatars(row.signers)"
              :size="22"
              :max="6"
            />
            <div v-else class="mt-1 flex flex-col gap-1">
              <div
                v-for="(s, k) in row.signers"
                :key="k"
                class="flex items-center gap-1.5 min-w-0 text-[11px]"
              >
                <n-avatar
                  round
                  :size="18"
                  :src="s?.worker?.photo || Utils.noAvailableImage"
                  :fallback-src="Utils.noAvailableImage"
                />
                <span class="font-medium text-textColor1 truncate">{{ shortName(s?.worker) }}</span>
                <span class="shrink-0 text-textColor3">· {{ $t(roleLabel(s?.type)) }}</span>
              </div>
            </div>
          </template>

          <div
            v-if="row.comment"
            class="mt-1.5 rounded-md border-l-2 border-fig-red bg-fig-red-50 px-2 py-1 text-[11px] text-textColor1 leading-snug"
          >
            {{ row.comment }}
          </div>
          <div
            v-if="row.certificate?.serial"
            class="mt-1 inline-flex items-center gap-1 text-[11px] text-fig-chip-green-text"
          >
            <n-icon size="12"><ShieldCheckmark16Filled /></n-icon>
            {{ $t('documentPage.signature.approval.certificate') }}: {{ row.certificate.serial }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
