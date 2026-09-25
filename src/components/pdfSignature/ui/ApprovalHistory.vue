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

  // Ko'rsatkich nuqtasi va segment rangi — bir xil palitra.
  const SUMMARY_TONES = {
    approved: 'bg-fig-success',
    rejected: 'bg-fig-red',
    pending: 'bg-fig-orange-300'
  }
  const segmentTone = (statusId) => {
    if (statusId === STATUS.success) return SUMMARY_TONES.approved
    if (statusId === STATUS.rejected) return SUMMARY_TONES.rejected
    return 'bg-surface-line'
  }
</script>

<template>
  <div>
    <!-- Yig'ma: segmentli chiziq + uchta ko'rsatkich, bitta kartada -->
    <div
      v-if="confirmations.length"
      class="mb-3 rounded-xl border border-surface-line bg-surface-section px-3 pt-2.5 pb-2"
    >
      <div class="flex gap-1 mb-2.5">
        <span
          v-for="(c, idx) in confirmations"
          :key="idx"
          class="h-1.5 flex-1 rounded-full"
          :class="segmentTone(c.status?.id)"
        ></span>
      </div>
      <div class="grid grid-cols-3 divide-x divide-surface-line">
        <div v-for="(tone, key) in SUMMARY_TONES" :key="key" class="px-2 first:pl-0 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full shrink-0" :class="tone"></span>
            <span class="text-base font-semibold tabular-nums leading-tight text-textColor0">
              {{ summary[key] }}
            </span>
          </div>
          <div class="text-[10px] leading-tight text-textColor3 truncate mt-0.5">
            {{ $t(`documentPage.signature.approval.summary.${key}`) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="!groups.length" class="text-sm text-textColor3 text-center py-8">
      {{ $t('documentPage.signature.approval.noHistory') }}
    </div>

    <div v-for="group in groups" :key="group.key" class="mb-3">
      <!-- Kun sarlavhasi: pill + chiziq -->
      <div class="flex items-center gap-2 mb-2">
        <span
          class="text-[10px] font-semibold uppercase tracking-wide tabular-nums rounded-full px-2 py-0.5 bg-surface-ground text-textColor2"
        >
          {{
            dayLabel(group.key) ? $t(dayLabel(group.key)) : dayjs(group.key).format('DD.MM.YYYY')
          }}
        </span>
        <div class="flex-1 h-px bg-surface-line"></div>
      </div>

      <div v-for="(row, i) in group.items" :key="rowId(row)" class="relative flex gap-2.5">
        <!-- Lenta chizig'i: tugundan keyingi tugungacha -->
        <div
          v-if="i < group.items.length - 1"
          class="absolute left-[13.5px] top-8 bottom-0 w-px bg-fig-blue-100"
        ></div>

        <!-- Bir kishi — avatar + holat belgisi; guruh — harakat belgisi -->
        <div class="relative shrink-0 w-7 h-7 mt-1.5">
          <template v-if="row.signers.length === 1">
            <n-avatar
              round
              object-fit="cover"
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

        <!-- Hodisa kartasi -->
        <div class="min-w-0 flex-1 mb-2 rounded-lg border border-surface-line bg-surface-section px-2.5 py-2">
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
            <div v-if="row.file" class="mt-1.5 min-w-0">
              <span
                class="inline-flex max-w-full items-center gap-1 rounded-md border border-surface-line bg-fig-bg-secondary px-1.5 py-0.5 text-[11px] text-textColor1"
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
            <div v-else class="flex items-center gap-1.5 mt-1 min-w-0">
              <span
                class="shrink-0 text-[10px] font-medium rounded-full px-1.5 py-px bg-surface-ground text-textColor2"
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

          <!-- Guruh: «3 kishiga yuborildi» + avatarlar; bosilsa ro'yxat ochiladi -->
          <template v-else>
            <button
              type="button"
              class="w-full flex items-start justify-between gap-2 text-left"
              @click="toggle(rowId(row))"
            >
              <span class="text-xs font-semibold text-textColor0 leading-snug">
                {{
                  $t(`documentPage.signature.approval.groups.${row.type}`, {
                    count: row.signers.length
                  })
                }}
              </span>
              <span class="text-[11px] tabular-nums text-textColor3 shrink-0">
                {{ row.date.format('HH:mm') }}
              </span>
            </button>

            <!-- Yig'iq va ochiq ko'rinish balandlik animatsiyasi bilan almashadi -->
            <n-collapse-transition :show="!expanded.has(rowId(row))">
              <button
                type="button"
                class="mt-1.5 w-full flex items-center justify-between gap-2"
                @click="toggle(rowId(row))"
              >
                <!-- Ko'p odam bo'lsa: 5 tadan keyingisi «+N»; guruh qisqarishi mumkin,
                     «Barchasi» esa doim o'z joyida qoladi -->
                <UIUserGroup
                  class="history-avatars min-w-0 flex-1 overflow-hidden flex justify-start"
                  :data="avatars(row.signers)"
                  :size="22"
                  :max="5"
                  :has-more="Math.max(row.signers.length - 4, 0)"
                />
                <span class="flex items-center gap-0.5 text-[11px] font-medium text-primary shrink-0">
                  {{ $t('documentPage.signature.approval.showAll') }}
                  <n-icon size="12"><ChevronDown16Regular /></n-icon>
                </span>
              </button>
            </n-collapse-transition>

            <n-collapse-transition :show="expanded.has(rowId(row))">
              <div class="mt-1.5 flex flex-col divide-y divide-surface-line border-t border-surface-line">
                <div
                  v-for="(s, k) in row.signers"
                  :key="k"
                  class="flex items-center gap-2 min-w-0 py-1.5"
                >
                  <n-avatar
                    round
                    object-fit="cover"
                    class="shrink-0"
                    :size="22"
                    :src="s?.worker?.photo || Utils.noAvailableImage"
                    :fallback-src="Utils.noAvailableImage"
                  />
                  <span class="flex-1 min-w-0 text-[11px] font-medium text-textColor1 truncate">
                    {{ shortName(s?.worker) }}
                  </span>
                  <span
                    class="shrink-0 text-[10px] font-medium rounded-full px-1.5 py-px bg-surface-ground text-textColor2"
                  >
                    {{ $t(roleLabel(s?.type)) }}
                  </span>
                </div>
                <button
                  type="button"
                  class="pt-1.5 flex items-center justify-center gap-0.5 text-[11px] font-medium text-primary"
                  @click="toggle(rowId(row))"
                >
                  {{ $t('content.hide') }}
                  <n-icon size="12" class="rotate-180"><ChevronDown16Regular /></n-icon>
                </button>
              </div>
            </n-collapse-transition>
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

<style scoped>
  /* Global `.ui__user-group` rasmni 36×42 qilib beradi — 22px doirada rasm
     cho'zilib (aspect-ratio buzilib) ko'rinardi. Bu yerda kvadratga qaytariladi. */
  .history-avatars :deep(.ui__user-group > img) {
    width: 22px !important;
    height: 22px !important;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }

  .history-avatars :deep(.n-avatar-group) {
    --n-gap: -6px !important;
    flex-wrap: nowrap;
    /* Avatarlar chapdan o'ngga — guruh keng joyni egallasa ham o'rtaga surilmasin */
    justify-content: flex-start;
    width: max-content;
  }
  .history-avatars :deep(.has-more-avatar) {
    font-size: 10px;
    flex-shrink: 0;
  }
</style>
