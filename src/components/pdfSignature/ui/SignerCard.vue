<script setup>
  import { UIUser, UIStatus } from '@/components/index.js'
  import {
    Link28Filled,
    Chat20Filled,
    ChevronDown16Regular,
    ShieldCheckmark16Filled
  } from '@vicons/fluent'
  import { EVENT, STATUS, lastActionDate } from '../utils/approvalHistory.js'
  import { eventMeta, signerTone } from '../utils/eventMeta.js'

  const props = defineProps({
    item: { type: Object, required: true },
    step: { type: Number, required: true },
    isLast: { type: Boolean, default: false },
    isSelf: { type: Boolean, default: false },
    events: { type: Array, default: () => [] },
    canLink: { type: Boolean, default: false },
    linkLoading: { type: Boolean, default: false }
  })

  const emit = defineEmits(['link', 'chat'])

  const expanded = ref(false)

  const tone = computed(() => signerTone(props.item.status?.id))
  const isApproved = computed(() => props.item.status?.id === STATUS.success)
  const isRejected = computed(() => props.item.status?.id === STATUS.rejected)
  const actedAt = computed(() => lastActionDate(props.events))

  const rejectComment = computed(() => {
    if (!isRejected.value) return null
    return (
      props.item.comment ||
      [...props.events].reverse().find((e) => e.type === EVENT.rejected)?.comment ||
      null
    )
  })

  const certificate = computed(
    () => [...props.events].reverse().find((e) => e.type === EVENT.approved)?.certificate
  )
</script>

<template>
  <div class="flex gap-3">
    <!-- Stepper tuguni va keyingi bosqichga ulovchi chiziq -->
    <div class="flex flex-col items-center shrink-0 pt-1.5">
      <div
        class="w-7 h-7 rounded-full border flex items-center justify-center shadow-sm"
        :class="tone.node"
      >
        <n-icon size="14"><component :is="tone.icon" /></n-icon>
      </div>
      <div v-if="!isLast" class="w-0.5 flex-1 mt-1 rounded-full" :class="tone.line"></div>
    </div>

    <div
      class="flex-1 min-w-0 mb-2 rounded-xl border bg-surface-section overflow-hidden"
      :class="[tone.card, isSelf && 'ring-1 ring-primary/40']"
    >
      <div class="px-3 py-1.5">
        <!-- Bosqich, sana va status bitta qatorda — karta balandligi kichik bo'lsin -->
        <div class="flex items-center justify-between gap-2 mb-1">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-textColor3 shrink-0">
              {{ $t('documentPage.signature.approval.step', { n: step }) }}
            </span>
            <span v-if="actedAt" class="text-[10px] tabular-nums text-textColor3 truncate">
              · {{ actedAt.format('DD.MM.YYYY HH:mm') }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span
              v-if="isSelf"
              class="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-fig-chip-brand text-fig-chip-brand-text"
            >
              {{ $t('documentPage.signature.approval.you') }}
            </span>
            <UIStatus fig :status="item.status" />
          </div>
        </div>

        <UIUser
          :short="false"
          :data="{
            photo: item.worker?.photo,
            lastName: item.worker?.last_name,
            firstName: item.worker?.first_name,
            middleName: item.worker?.middle_name,
            position: ''
          }"
        >
          <template #position>
            <!-- 2 qatordan oshsa kesiladi, to'liq matn hover'da tooltip'da -->
            <n-ellipsis
              :line-clamp="2"
              :tooltip="{ style: { maxWidth: '300px' } }"
              class="w-full leading-[1.1] text-textColor3 text-xs"
            >
              {{ item.type === 'w' ? $t('content.worker') : item.position }}
            </n-ellipsis>
          </template>
        </UIUser>

        <div
          v-if="isApproved"
          class="mt-2 flex items-start gap-1.5 rounded-lg bg-fig-chip-green px-2 py-1.5 text-[11px] text-fig-chip-green-text"
        >
          <n-icon size="14" class="shrink-0 mt-px"><ShieldCheckmark16Filled /></n-icon>
          <div class="min-w-0 leading-tight">
            <div class="font-semibold">{{ $t('documentPage.signature.approval.signedWithEri') }}</div>
            <div v-if="certificate" class="opacity-80 truncate">
              {{ $t('documentPage.signature.approval.certificate') }}: {{ certificate.serial }}
            </div>
          </div>
        </div>

        <div
          v-if="rejectComment"
          class="mt-2 rounded-lg border-l-2 border-fig-red bg-fig-red-50 px-2 py-1.5 text-[11px] text-fig-text-red"
        >
          <div class="font-semibold mb-0.5">{{ $t('documentPage.signature.rejectedReason') }}</div>
          <div class="text-textColor1 leading-snug">{{ rejectComment }}</div>
        </div>
      </div>

      <div
        class="flex items-center gap-1 px-2 py-0.5 border-t border-dashed border-surface-line bg-surface-ground/40"
      >
        <n-button quaternary size="tiny" @click="expanded = !expanded">
          <template #icon>
            <n-icon
              size="14"
              class="transition-transform"
              :class="expanded && 'rotate-180'"
            >
              <ChevronDown16Regular />
            </n-icon>
          </template>
          {{ $t('documentPage.signature.approval.actions') }} ({{ events.length }})
        </n-button>

        <n-button
          v-if="canLink"
          :loading="linkLoading"
          round
          secondary
          type="info"
          size="tiny"
          @click="emit('link', item)"
        >
          {{ $t('documentPage.signature.link') }}
          <template #icon><Link28Filled /></template>
        </n-button>

        <!-- Wrapper'da `ml-auto`: tugma footer'ning o'ng chetiga suriladi.
             Rangli fon va matn — tugma ko'zga tashlansin, oddiy ikonka sezilmasdi. -->
        <div v-if="!isSelf" class="ml-auto">
          <n-button secondary round type="primary" size="tiny" @click="emit('chat', item)">
            <template #icon>
              <n-icon size="14"><Chat20Filled /></n-icon>
            </template>
            {{ $t('documentPage.signature.approval.chat') }}
          </n-button>
        </div>
      </div>

      <n-collapse-transition :show="expanded">
        <div class="px-3 py-2 border-t border-surface-line">
          <div v-if="!events.length" class="text-xs text-textColor3 py-1">
            {{ $t('documentPage.signature.approval.noHistory') }}
          </div>
          <div v-for="(ev, i) in events" :key="i" class="flex gap-2">
            <div class="flex flex-col items-center shrink-0">
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center"
                :class="eventMeta[ev.type]?.dot"
              >
                <n-icon size="11"><component :is="eventMeta[ev.type]?.icon" /></n-icon>
              </div>
              <div v-if="i < events.length - 1" class="w-px flex-1 bg-surface-line my-0.5"></div>
            </div>
            <div class="min-w-0 flex-1 pb-2">
              <div class="flex items-baseline justify-between gap-2">
                <span class="text-xs font-medium text-textColor1">{{ $t(eventMeta[ev.type]?.label) }}</span>
                <span class="text-[10px] tabular-nums text-textColor3 shrink-0">
                  {{ ev.date.format('DD.MM.YYYY HH:mm') }}
                </span>
              </div>
              <div v-if="ev.comment" class="text-[11px] text-textColor2 italic leading-snug mt-0.5">
                “{{ ev.comment }}”
              </div>
            </div>
          </div>
        </div>
      </n-collapse-transition>
    </div>
  </div>
</template>
