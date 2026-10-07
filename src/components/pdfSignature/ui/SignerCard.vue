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
    linkLoading: { type: Boolean, default: false }
  })

  const emit = defineEmits(['link', 'chat'])

  const tone = computed(() => signerTone(props.item.status?.id))
  const isRejected = computed(() => props.item.status?.id === STATUS.rejected)
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
    <!-- Stepper tuguni va keyingi bosqichga ulovchi chiziq -->
    <div class="flex flex-col items-center shrink-0 pt-1.5">
      <div class="w-7 h-7 rounded-full border flex items-center justify-center" :class="tone.node">
        <n-icon size="14"><component :is="tone.icon" /></n-icon>
      </div>
      <div v-if="!isLast" class="w-0.5 flex-1 mt-1 rounded-full" :class="tone.line"></div>
    </div>

    <div
      class="flex-1 min-w-0 mb-2 rounded-xl border bg-surface-section overflow-hidden shadow-[0_1px_2px_rgb(16_24_40/0.04)]"
      :class="[tone.card, isSelf && 'ring-1 ring-fig-blue-300']"
    >
      <div class="px-3 pt-2.5 pb-2">
        <!-- Holat o'ng yuqori burchakda; faqat ism unga joy qoldiradi,
             lavozim esa kartaning o'ng chetigacha boradi -->
        <div class="relative">
          <div class="absolute top-0 right-0 z-[1]">
            <!-- Harakat vaqti badge ustiga olib borilganda ko'rinadi -->
            <n-popover trigger="hover" placement="bottom-end" :disabled="!actedAt">
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
          </div>
          <div class="min-w-0">
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
              <!-- Tor kartada ism kesilmasin: kichikroq shrift, kerak bo'lsa 2 qator -->
              <template #name="{ title }">
                <n-ellipsis
                  :line-clamp="2"
                  :tooltip="{ style: { maxWidth: '300px' } }"
                  class="w-full pr-[84px] text-xs font-medium text-textColor1 leading-[1.25]"
                >
                  {{ title }}
                </n-ellipsis>
              </template>
              <template #position>
                <!-- 2 qatordan oshsa kesiladi, to'liq matn hover'da tooltip'da -->
                <n-ellipsis
                  :line-clamp="2"
                  :tooltip="{ style: { maxWidth: '300px' } }"
                  class="w-full mt-0.5 leading-[1.2] text-textColor3 text-[11px]"
                >
                  {{ item.type === 'w' ? $t('content.worker') : item.position }}
                </n-ellipsis>
              </template>
            </UIUser>
          </div>
        </div>

        <!-- Qo'shimcha ma'lumot: "Siz" va tanishuvchi (`r`, imzolamaydi) belgilari -->
        <div v-if="isSelf || item.type === 'r'" class="flex items-center gap-2 mt-2">
          <span
            v-if="isSelf"
            class="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-fig-chip-brand text-fig-chip-brand-text"
          >
            {{ $t('documentPage.signature.approval.you') }}
          </span>
          <span
            v-if="item.type === 'r'"
            class="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-fig-chip-indigo text-fig-chip-indigo-text"
          >
            {{ $t('applicationPage.forward.viewerChip') }}
          </span>
        </div>
      </div>

      <!-- Harakatlar va rad etish sababi «Harakatlar tarixi» tabida -->
      <div
        v-if="canLink || !isSelf"
        class="flex items-center gap-1 px-2 py-1 border-t border-surface-line/60 bg-surface-ground/40"
      >
        <div class="ml-auto flex items-center gap-1.5">
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
