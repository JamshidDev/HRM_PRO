<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import { ArrowDown16Regular, CalendarLtr16Regular, Clock16Regular } from '@vicons/fluent'
  import WorkerCard from './WorkerCard.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  // O'zgartirilgan kun haqida: grafik bo'yicha reja, hozirgi holat, kim bilan almashgan.
  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()
  const info = computed(() => store.changeInfo)
  const sub = computed(() => store.changeInfo.substitution)
  const onCancelSub = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    store._cancelSubstitution(sub.value.id)
  }
  const fmt = (d) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : '')
  // O'rinbosarlik juftligi: kim dam oladi (A) va kim o'rniga chiqadi (B); bosilgan xodim ajratib ko'rsatiladi.
  const pair = computed(() => {
    const s = sub.value
    if (!s) return null
    const me = { name: info.value.worker, position: info.value.position, self: true }
    const other = { name: s.name, position: s.position, self: false }
    return s.role === 'absent' ? { absent: me, substitute: other } : { absent: other, substitute: me }
  })
  const shiftTime = computed(() => (sub.value ? `${sub.value.start_time}–${sub.value.end_time}` : ''))
  // O'rinbosarning shu kungi o'z rejasi (faqat o'rinbosar bosilganda ma'lum).
  const substituteOwn = computed(() => {
    const o = sub.value?.role === 'substitute' ? sub.value.original : null
    if (!o) return null
    return o.work_status ? `${o.start_time}–${o.end_time}` : t('shiftType.groupView.rest')
  })
</script>

<template>
  <UIModal v-model:visible="store.changeInfo.visible" :width="480" :title="sub ? $t('shiftType.groupView.subInfoTitle') : $t('shiftType.groupView.changeTitle')">
    <div class="flex flex-col gap-4 text-sm">
      <WorkerCard v-if="!sub" :name="info.worker" :position="[info.crew, fmt(info.date)].filter(Boolean).join(' · ')" />

      <template v-if="sub">
        <div class="rounded-xl bg-surface-ground px-3 py-2 text-[13px] leading-[1.4]">
          {{ $t('shiftType.groupView.subSummary', { date: fmt(info.date), sub: pair.substitute.name, absent: pair.absent.name, time: shiftTime }) }}
        </div>
        <div class="flex items-center justify-between gap-2 text-xs text-secondary">
          <span class="flex items-center gap-1.5">
            <n-icon size="16"><CalendarLtr16Regular /></n-icon>
            {{ fmt(info.date) }}
          </span>
          <span class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-ground text-textColor1 font-medium">
            <n-icon size="14"><Clock16Regular /></n-icon>
            {{ shiftTime }}
          </span>
        </div>

        <div
          v-for="(p, key) in { absent: pair.absent, substitute: pair.substitute }"
          :key="key"
          class="contents"
        >
          <WorkerCard
            :name="p.name"
            :position="p.position"
            :tone="key === 'absent' ? 'danger' : 'success'"
            :highlight="p.self"
          >
            <template #aside>
              <span v-if="key === 'absent' || substituteOwn" class="text-secondary line-through">
                {{ key === 'absent' ? shiftTime : substituteOwn }}
              </span>
              <span
                class="px-1.5 py-0.5 rounded font-medium"
                :class="key === 'absent' ? 'bg-fig-red-50 text-fig-text-red' : 'bg-success/10 text-success'"
              >
                {{ key === 'absent' ? $t('shiftType.groupView.subAbsentLabel') : $t('shiftType.groupView.subWorksLabel') }}
              </span>
            </template>
          </WorkerCard>
          <div v-if="key === 'absent'" class="flex items-center gap-2 pl-3 -my-1 text-xs text-warning font-medium">
            <span class="w-7 h-7 rounded-full bg-warning/10 flex items-center justify-center">
              <n-icon size="14"><ArrowDown16Regular /></n-icon>
            </span>
            {{ $t('shiftType.groupView.subArrow') }}
          </div>
        </div>

      </template>
      <template v-else>
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-surface-line px-3 py-2">
          <div class="text-xs text-secondary">{{ $t('shiftType.groupView.planned') }}</div>
          <div class="font-medium mt-1">{{ info.planned }}</div>
        </div>
        <div class="rounded-xl border border-primary/60 bg-primary/5 px-3 py-2">
          <div class="text-xs text-secondary">{{ $t('shiftType.groupView.actual') }}</div>
          <div class="font-medium mt-1 text-primary">{{ info.actual }}</div>
        </div>
      </div>

      <div v-if="info.sub" class="flex justify-between gap-3">
        <span class="text-secondary">{{ $t('shiftType.groupView.worksInstead') }}</span>
        <span class="font-medium text-right">{{ info.sub }}</span>
      </div>
      <div v-else class="flex justify-between gap-3">
        <span class="text-secondary">{{ $t('shiftType.groupView.swappedWith') }}</span>
        <span v-if="info.partner" class="font-medium text-right">
          {{ info.partner.name }}
          <span v-if="info.partner.crew" class="text-secondary font-normal">· {{ info.partner.crew }}</span>
        </span>
        <span v-else class="text-secondary text-right">{{ $t('shiftType.groupView.partnerUnknown') }}</span>
      </div>

      </template>

      <div class="flex justify-end gap-3 pt-2">
        <n-button
          v-if="sub && !store.isPastMonth"
          type="error"
          secondary
          :loading="store.replaceLoading"
          @click="onCancelSub"
        >
          {{ $t('shiftType.groupView.subCancel') }}
        </n-button>
        <n-button @click="store.changeInfo.visible = false">{{ $t('content.close') }}</n-button>
      </div>
    </div>
  </UIModal>
</template>
