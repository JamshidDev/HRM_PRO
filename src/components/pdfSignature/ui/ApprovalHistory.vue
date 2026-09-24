<script setup>
  import { UIUser } from '@/components/index.js'
  import { ShieldCheckmark16Filled } from '@vicons/fluent'
  import { eventMeta } from '../utils/eventMeta.js'

  const props = defineProps({
    confirmations: { type: Array, default: () => [] },
    bySigner: { type: Array, default: () => [] },
    isMock: { type: Boolean, default: false }
  })

  // Barcha imzolovchilar harakatlari bitta xronologik lentaga (yangi — tepada),
  // kunlar bo'yicha guruhlangan.
  const groups = computed(() => {
    const flat = props.bySigner.flatMap((events, idx) =>
      events.map((ev) => ({ ...ev, signer: props.confirmations[idx] }))
    )
    flat.sort((a, b) => b.date.valueOf() - a.date.valueOf())

    const map = new Map()
    flat.forEach((ev) => {
      const key = ev.date.format('DD.MM.YYYY')
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(ev)
    })
    return [...map.entries()].map(([date, items]) => ({ date, items }))
  })
</script>

<template>
  <div>
    <div
      v-if="isMock"
      class="mb-3 rounded-lg border border-dashed border-fig-orange-300 bg-fig-chip-amber px-3 py-2 text-[11px] text-fig-chip-amber-text"
    >
      {{ $t('documentPage.signature.approval.mockNotice') }}
    </div>

    <div v-if="!groups.length" class="text-sm text-textColor3 text-center py-8">
      {{ $t('documentPage.signature.approval.noHistory') }}
    </div>

    <div v-for="group in groups" :key="group.date" class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-[11px] font-semibold text-textColor2 tabular-nums">{{ group.date }}</span>
        <div class="flex-1 h-px bg-surface-line"></div>
      </div>

      <div v-for="(ev, i) in group.items" :key="i" class="flex gap-3">
        <div class="flex flex-col items-center shrink-0">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center"
            :class="eventMeta[ev.type]?.dot"
          >
            <n-icon size="14"><component :is="eventMeta[ev.type]?.icon" /></n-icon>
          </div>
          <div v-if="i < group.items.length - 1" class="w-px flex-1 bg-surface-line my-1"></div>
        </div>

        <div class="min-w-0 flex-1 pb-3">
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-xs font-semibold text-textColor0">{{ $t(eventMeta[ev.type]?.label) }}</span>
            <span class="text-[11px] tabular-nums text-textColor3 shrink-0">
              {{ ev.date.format('HH:mm') }}
            </span>
          </div>
          <div class="mt-1">
            <UIUser
              :short="false"
              :data="{
                photo: ev.signer?.worker?.photo,
                lastName: ev.signer?.worker?.last_name,
                firstName: ev.signer?.worker?.first_name,
                middleName: ev.signer?.worker?.middle_name,
                position: ''
              }"
            >
              <template #position>
                <div class="text-[11px] text-textColor3 leading-tight">
                  {{ ev.signer?.type === 'w' ? $t('content.worker') : ev.signer?.position }}
                </div>
              </template>
            </UIUser>
          </div>
          <div
            v-if="ev.comment"
            class="mt-1.5 rounded-md border-l-2 border-fig-red bg-fig-red-50 px-2 py-1 text-[11px] text-textColor1 leading-snug"
          >
            {{ ev.comment }}
          </div>
          <div
            v-if="ev.certificate"
            class="mt-1.5 inline-flex items-center gap-1 text-[11px] text-fig-chip-green-text"
          >
            <n-icon size="12"><ShieldCheckmark16Filled /></n-icon>
            {{ $t('documentPage.signature.approval.certificate') }}: {{ ev.certificate.serial }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
