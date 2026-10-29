<script setup>
  import { UIUser, UIStatus } from '@/components/index.js'
  import { Link28Filled, Chat20Filled } from '@vicons/fluent'
  import { STATUS, lastActionDate } from '../utils/approvalHistory.js'
  import { signerTone } from '../utils/eventMeta.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    item: { type: Object, required: true },
    isLast: { type: Boolean, default: false },
    isSelf: { type: Boolean, default: false },
    events: { type: Array, default: () => [] },
    canLink: { type: Boolean, default: false },
    linkLoading: { type: Boolean, default: false },
    // Tartibli marshrut: kelishuvchining navbat raqami (parallelda null).
    step: { type: Number, default: null },
    // Hozir shu kelishuvchining navbati / u hali navbatini kutyapti.
    current: { type: Boolean, default: false },
    waiting: { type: Boolean, default: false }
  })

  const emit = defineEmits(['link', 'chat'])

  const tone = computed(() => signerTone(props.item.status?.id))
  const isRejected = computed(() => props.item.status?.id === STATUS.rejected)
  // Rahbar kartasi ko'k fonda ajralib turadi.
  const isDirector = computed(() => props.item.type === 'd')
  // Hali imzolamagan/rad etmagan kelishuvchi tugunida belgi o'rniga navbat raqami.
  const isDone = computed(() => [STATUS.success, STATUS.rejected].includes(props.item.status?.id))
  const showStep = computed(() => props.step != null && !isDone.value)
  const actedAt = computed(() => lastActionDate(props.events))
  const actedLabel = computed(() => {
    if (props.item.status?.id === STATUS.success)
      return t('documentPage.signature.approval.events.approved')
    if (isRejected.value) return t('documentPage.signature.approval.events.rejected')
    return null
  })
</script>

<template>
  <div class="flex gap-3">
    <!-- Stepper tuguni va keyingi bosqichga ulovchi chiziq.
         `pl-2`: navbatdagi tugun to'lqini ro'yxatning `overflow-x: clip` chetida kesilmasin -->
    <div class="flex flex-col items-center shrink-0 pt-2 pl-2">
      <div
        class="relative size-5.5 rounded-full border flex items-center justify-center"
        :class="current ? 'border-primary bg-primary text-white' : tone.node"
      >
        <!-- Navbati kelgan kelishuvchi tugunidan tarqaladigan to'lqin (ripple) -->
        <template v-if="current">
          <span class="signer-ripple" aria-hidden="true"></span>
          <span class="signer-ripple signer-ripple--late" aria-hidden="true"></span>
        </template>
        <span v-if="showStep" class="relative text-[10px] font-bold tabular-nums">{{ step }}</span>
        <n-icon v-else size="12" class="relative"><component :is="tone.icon" /></n-icon>
      </div>
      <div v-if="!isLast" class="w-0.5 flex-1 mt-1 rounded-full" :class="tone.line"></div>
    </div>

    <div
      class="flex-1 min-w-0 mb-1.5 rounded-xl border overflow-hidden shadow-[0_1px_2px_rgb(16_24_40/0.04)]"
      :class="[
        tone.card,
        isDirector ? 'signer-card--director' : 'bg-surface-section',
        isSelf && 'ring-1 ring-fig-blue-300',
        current && 'ring-2 ring-primary/60',
        waiting && 'opacity-70'
      ]"
    >
      <!-- Ism va lavozim — har biri bitta qatorda, to'liq matn hover'da tooltip'da -->
      <div class="px-2.5 py-1.5">
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
          <template #name="{ title }">
            <n-ellipsis
              :tooltip="{ style: { maxWidth: '300px' } }"
              class="w-full text-xs font-medium text-textColor1 leading-[1.3]"
            >
              {{ title }}
            </n-ellipsis>
          </template>
          <template #position>
            <n-ellipsis
              :tooltip="{ style: { maxWidth: '300px' } }"
              class="w-full leading-[1.3] text-textColor3 text-[11px]"
            >
              {{ item.type === 'w' ? $t('content.worker') : item.position }}
            </n-ellipsis>
          </template>
        </UIUser>
      </div>

      <!-- Pastki qator: chapda holat va belgilar, o'ngda harakatlar.
           Harakatlar va rad etish sababi «Harakatlar tarixi» tabida -->
      <div
        class="flex items-center gap-1.5 px-2 py-1 border-t border-surface-line/60 bg-surface-ground/40"
      >
        <div class="flex flex-wrap items-center gap-1 min-w-0">
          <!-- Harakat vaqti badge ustiga olib borilganda ko'rinadi -->
          <n-popover trigger="hover" placement="bottom-start" :disabled="!actedAt">
            <template #trigger>
              <span class="inline-flex">
                <!-- Tanishuvchi imzolamaydi: «Tanishdi» (ochgan) yoki «Tanishishni kutmoqda» -->
                <span
                  v-if="item.type === 'r'"
                  class="text-[10px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap"
                  :class="
                    item.status?.id >= 2
                      ? 'bg-fig-chip-green text-fig-chip-green-text'
                      : 'bg-surface-ground text-textColor3'
                  "
                >
                  {{
                    item.status?.id >= 2
                      ? $t('applicationPage.forward.viewerRead')
                      : $t('applicationPage.forward.viewerWaiting')
                  }}
                </span>
                <span
                  v-else-if="waiting"
                  class="text-[10px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap bg-surface-ground text-textColor3"
                >
                  {{ $t('documentPage.signature.approval.waitingTurn') }}
                </span>
                <UIStatus v-else fig compact :tooltip="false" :status="item.status" />
              </span>
            </template>
            <div class="text-xs">
              <div v-if="actedLabel" class="font-semibold text-textColor1">{{ actedLabel }}</div>
              <div class="tabular-nums text-textColor3">
                {{ actedAt?.format('DD.MM.YYYY HH:mm') }}
              </div>
            </div>
          </n-popover>
          <!-- "Navbatda", "Siz" va tanishuvchi (`r`, imzolamaydi) belgilari -->
          <span
            v-if="current"
            class="text-[10px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap bg-primary text-white"
          >
            {{ $t('documentPage.signature.approval.nowTurn') }}
          </span>
          <span
            v-if="isSelf"
            class="text-[10px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap bg-fig-chip-brand text-fig-chip-brand-text"
          >
            {{ $t('documentPage.signature.approval.you') }}
          </span>
          <span
            v-if="item.type === 'r'"
            class="text-[10px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap bg-fig-chip-indigo text-fig-chip-indigo-text"
          >
            {{ $t('applicationPage.forward.viewerChip') }}
          </span>
        </div>
        <div class="ml-auto shrink-0 flex items-center gap-1.5">
          <n-tooltip v-if="canLink" trigger="hover">
            <template #trigger>
              <n-button
                :loading="linkLoading"
                circle
                secondary
                type="info"
                size="tiny"
                @click="emit('link', item)"
              >
                <template #icon><Link28Filled /></template>
              </n-button>
            </template>
            {{ $t('documentPage.signature.link') }}
          </n-tooltip>
          <n-button
            v-if="!isSelf"
            secondary
            round
            type="primary"
            size="tiny"
            @click="emit('chat', item)"
          >
            <template #icon>
              <n-icon size="14"><Chat20Filled /></n-icon>
            </template>
            {{ $t('documentPage.signature.approval.chat') }}
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Rahbar kartasi: chap yuqoridan brend ko'k tusi karta foniga o'tib boradi.
     Ko'k ulushi `color-mix` bilan olinadi — yorug' va qorong'i mavzuda ham bir xil ishlaydi */
  .signer-card--director {
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--fig-bg-brand-fill) 16%, transparent) 0%,
        color-mix(in srgb, var(--fig-bg-brand-fill) 3%, transparent) 70%
      ),
      var(--surface-section);
  }

  /* Tugundan tashqariga kengayib, so'nib boradigan halqa; ikkinchisi yarim davr kechikadi */
  .signer-ripple {
    position: absolute;
    inset: -1px;
    border-radius: 9999px;
    background: var(--color-primary);
    opacity: 0;
    pointer-events: none;
    animation: signer-ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .signer-ripple--late {
    animation-delay: 1s;
  }

  @keyframes signer-ripple {
    0% {
      transform: scale(1);
      opacity: 0.45;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }

  /* Harakatni kamaytirish so'ralgan bo'lsa to'lqin ko'rsatilmaydi */
  @media (prefers-reduced-motion: reduce) {
    .signer-ripple {
      display: none;
    }
  }
</style>
