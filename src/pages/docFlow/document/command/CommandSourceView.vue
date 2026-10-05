<script setup>
  import dayjs from 'dayjs'
  import {
    DocumentLink20Regular,
    Open20Regular,
    DocumentText20Regular,
    Person20Regular,
    Briefcase20Regular,
    PeopleTeam20Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'

  // Shartnoma/QK asosidagi buyruq — ma'lumotlar faqat ko'rish uchun, tahrir manba hujjatda.
  const props = defineProps({
    source: { type: Object, required: true },
    details: { type: Object, default: null },
    signers: { type: Array, default: () => [] }
  })
  const emits = defineEmits(['open-source'])

  const isContract = computed(() => props.source.kind === 'contract')
  const prefix = 'documentPage.command.dataTab.source'

  const date = (v) => (v ? dayjs(v).format('DD.MM.YYYY') : null)
  const photo = (v) => v || Utils.noAvailableImage

  const commandFields = computed(() => {
    const c = props.details?.command
    return [
      { key: 'number', value: c?.number },
      { key: 'date', value: date(c?.date) },
      { key: 'type', value: c?.type_name ? `${c.type} - ${c.type_name}` : c?.type, wide: true }
    ]
  })

  const workerFields = computed(() => {
    const d = props.details
    return [
      { key: 'organization', value: d?.organization },
      { key: 'currentPosition', value: d?.current_position, wide: true }
    ].filter((f) => f.value)
  })

  const termFields = computed(() => {
    const d = props.details || {}
    const time = [d.start_time, d.end_time].filter(Boolean).join(' – ')
    return [
      { key: 'position', value: d.position || d.post_name, wide: true },
      {
        key: 'salary',
        value: d.salary ? Utils.formatNumberToMoney(d.salary) : null,
        suffix: 'sum'
      },
      { key: 'rate', value: d.rate },
      { key: 'group', value: d.group },
      { key: 'rank', value: d.rank },
      { key: 'probation', value: d.probation },
      { key: 'vacationMain', value: d.vacation_main_day, suffix: 'days' },
      { key: 'vacationAdditional', value: d.additional_vacation_day, suffix: 'days' },
      { key: 'positionDate', value: date(d.position_date) },
      { key: 'contractTo', value: date(d.contract_to_date) },
      { key: 'workDays', value: d.work_day || d.week_days },
      { key: 'workTime', value: time }
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '')
  })

  const suffixed = (f, t) =>
    f.suffix === 'sum'
      ? t(`${prefix}.fields.sum`, { value: f.value })
      : f.suffix === 'days'
        ? t(`${prefix}.fields.days`, { count: f.value })
        : f.value
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Manba hujjat: tahrir faqat shu orqali -->
    <div
      class="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3.5 flex flex-wrap items-center gap-3"
    >
      <div class="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <n-icon size="22" class="text-primary"><DocumentLink20Regular /></n-icon>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="text-sm font-semibold text-textColor0">
            {{
              $t(`${prefix}.${isContract ? 'titleContract' : 'titleAdditional'}`, {
                number: source.number || '—'
              })
            }}
          </span>
          <span v-if="source.date" class="text-xs tabular-nums text-textColor3">
            {{ date(source.date) }}
          </span>
          <span
            v-if="source.type_name"
            class="text-[11px] font-medium rounded-md px-1.5 py-px bg-surface-section text-textColor2 border border-surface-line"
          >
            {{ source.type_name }}
          </span>
        </div>
        <p class="text-xs text-textColor2 mt-1 leading-snug text-pretty">
          {{ $t(`${prefix}.${isContract ? 'hintContract' : 'hintAdditional'}`) }}
        </p>
      </div>
      <span v-if="source.deleted" class="shrink-0 text-xs font-medium text-fig-text-red">
        {{ $t(`${prefix}.deleted`) }}
      </span>
      <n-button
        v-else
        type="primary"
        secondary
        size="small"
        class="shrink-0"
        @click="emits('open-source', source)"
      >
        <template #icon>
          <n-icon><Open20Regular /></n-icon>
        </template>
        {{ $t(`${prefix}.${isContract ? 'openContract' : 'openAdditional'}`) }}
      </n-button>
    </div>

    <!-- Buyruq -->
    <section class="rounded-2xl border border-surface-line bg-surface-section px-5 py-4">
      <h4 class="flex items-center gap-1.5 mb-3 text-sm font-semibold text-textColor0">
        <n-icon size="16"><DocumentText20Regular /></n-icon>
        {{ $t(`${prefix}.sectionCommand`) }}
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
        <div
          v-for="f in commandFields"
          :key="f.key"
          :class="f.wide && 'sm:col-span-2 lg:col-span-1'"
        >
          <div class="text-[11px] leading-snug text-textColor3">
            {{ $t(`${prefix}.fields.${f.key}`) }}
          </div>
          <div class="mt-0.5 text-sm font-medium leading-snug text-textColor1 break-words">
            {{ f.value || '—' }}
          </div>
        </div>
        <div v-if="details?.command?.director" class="sm:col-span-2 lg:col-span-3">
          <div class="text-[11px] leading-snug text-textColor3">
            {{ $t(`${prefix}.fields.director`) }}
          </div>
          <div class="flex items-center gap-2.5 mt-1 min-w-0">
            <n-avatar
              round
              :size="30"
              :src="photo(details.command.director.photo)"
              :fallback-src="Utils.noAvailableImage"
            />
            <div class="min-w-0">
              <div class="text-sm font-medium text-textColor1 truncate">
                {{ details.command.director.full_name }}
              </div>
              <n-ellipsis
                v-if="details.command.director.position"
                class="text-[11px] text-textColor3"
                :tooltip="{ style: { maxWidth: '360px' } }"
              >
                {{ details.command.director.position }}
              </n-ellipsis>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Xodim -->
    <section class="rounded-2xl border border-surface-line bg-surface-section px-5 py-4">
      <h4 class="flex items-center gap-1.5 mb-3 text-sm font-semibold text-textColor0">
        <n-icon size="16"><Person20Regular /></n-icon>
        {{ $t(`${prefix}.sectionWorker`) }}
      </h4>
      <div v-if="details?.worker" class="flex items-center gap-3 mb-3">
        <n-avatar
          round
          :size="40"
          :src="photo(details.worker.photo)"
          :fallback-src="Utils.noAvailableImage"
        />
        <div class="text-sm font-semibold text-textColor0">{{ details.worker.full_name }}</div>
      </div>
      <div
        v-if="workerFields.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3"
      >
        <div
          v-for="f in workerFields"
          :key="f.key"
          :class="f.wide && 'sm:col-span-2 lg:col-span-2'"
        >
          <div class="text-[11px] leading-snug text-textColor3">
            {{ $t(`${prefix}.fields.${f.key}`) }}
          </div>
          <div class="mt-0.5 text-sm font-medium leading-snug text-textColor1 break-words">
            {{ f.value }}
          </div>
        </div>
      </div>
    </section>

    <!-- Lavozim va mehnat shartlari -->
    <section class="rounded-2xl border border-surface-line bg-surface-section px-5 py-4">
      <h4 class="flex items-center gap-1.5 mb-3 text-sm font-semibold text-textColor0">
        <n-icon size="16"><Briefcase20Regular /></n-icon>
        {{ $t(`${prefix}.sectionTerms`) }}
      </h4>
      <div
        v-if="termFields.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3"
      >
        <div v-for="f in termFields" :key="f.key" :class="f.wide && 'sm:col-span-2 lg:col-span-3'">
          <div class="text-[11px] leading-snug text-textColor3">
            {{ $t(`${prefix}.fields.${f.key}`) }}
          </div>
          <div class="mt-0.5 text-sm font-medium leading-snug text-textColor1 break-words">
            {{ suffixed(f, $t) }}
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-textColor3">{{ $t(`${prefix}.noTerms`) }}</p>
    </section>

    <!-- Kelishuvchilar -->
    <section class="rounded-2xl border border-surface-line bg-surface-section px-5 py-4">
      <h4 class="flex items-center gap-1.5 mb-3 text-sm font-semibold text-textColor0">
        <n-icon size="16"><PeopleTeam20Regular /></n-icon>
        {{ $t(`${prefix}.sectionSigners`) }}
      </h4>
      <div v-if="signers.length" class="flex flex-col gap-1.5">
        <div
          v-for="(s, i) in signers"
          :key="s.id"
          class="flex items-center gap-2.5 rounded-xl border border-surface-line px-3 py-2 min-w-0"
        >
          <span class="shrink-0 w-5 text-xs tabular-nums text-textColor3 text-center">
            {{ i + 1 }}
          </span>
          <n-avatar
            round
            :size="28"
            :src="photo(s.data?.photo)"
            :fallback-src="Utils.noAvailableImage"
          />
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium text-textColor1 truncate">
              {{
                [s.data?.lastName, s.data?.firstName, s.data?.middleName].filter(Boolean).join(' ')
              }}
            </div>
            <n-ellipsis
              v-if="s.data?.position"
              class="text-[11px] text-textColor3"
              :tooltip="{ style: { maxWidth: '360px' } }"
            >
              {{ s.data.position }}
            </n-ellipsis>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-textColor3">{{ $t(`${prefix}.noSigners`) }}</p>
    </section>
  </div>
</template>
