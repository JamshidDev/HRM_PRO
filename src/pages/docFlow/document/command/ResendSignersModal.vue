<script setup>
  import { Send20Regular, Warning20Regular } from '@vicons/fluent'
  import { UIUser, UIStatus } from '@/components/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  // Saqlashda: qayta imzolashga barchaga yoki tanlangan imzolovchilarga yuborish.
  const props = defineProps({
    visible: { type: Boolean, default: false },
    rows: { type: Array, default: () => [] },
    contentChanged: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  })
  const emits = defineEmits(['update:visible', 'confirm'])

  const STATUS_REJECTED = 4
  const mode = ref('all')
  const selected = ref([])

  // Ochilganda: rad etganlar va majburiylar oldindan belgilanadi.
  watch(
    () => props.visible,
    (v) => {
      if (!v) return
      mode.value = 'all'
      selected.value = props.rows
        .filter((r) => r.forced || r.status === STATUS_REJECTED)
        .map((r) => r.key)
    }
  )

  const isChecked = (row) => mode.value === 'all' || row.forced || selected.value.includes(row.key)
  const isDisabled = (row) => mode.value === 'all' || row.forced

  const toggle = (row, checked) => {
    if (isDisabled(row)) return
    selected.value = checked
      ? [...selected.value, row.key]
      : selected.value.filter((k) => k !== row.key)
  }

  const resendCount = computed(() => props.rows.filter(isChecked).length)

  const typeLabel = (type) => t(`documentPage.command.dataTab.resend.types.${type}`)
  const statusOf = (row) =>
    row.status === null
      ? { id: 1, name: t('documentPage.command.dataTab.resend.status.new') }
      : { id: row.status, name: t(`documentPage.command.dataTab.resend.status.${row.status}`) }

  const onConfirm = () => {
    emits('confirm', {
      resend_mode: mode.value,
      resend_keys: mode.value === 'selected' ? props.rows.filter(isChecked).map((r) => r.key) : []
    })
  }
</script>

<template>
  <n-modal
    :show="visible"
    preset="card"
    :title="$t('documentPage.command.dataTab.resend.title')"
    :mask-closable="!loading"
    :closable="!loading"
    style="width: 600px; max-width: calc(100vw - 32px)"
    @update:show="(v) => emits('update:visible', v)"
  >
    <div class="flex flex-col gap-3">
      <n-radio-group v-model:value="mode" class="w-full">
        <div class="grid grid-cols-2 gap-2">
          <label
            v-for="opt in ['all', 'selected']"
            :key="opt"
            class="flex items-start gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors"
            :class="
              mode === opt
                ? 'border-primary bg-primary/5'
                : 'border-surface-line bg-surface-section'
            "
          >
            <n-radio :value="opt" class="mt-0.5" />
            <div class="min-w-0">
              <div class="text-sm font-semibold text-textColor1">
                {{ $t(`documentPage.command.dataTab.resend.${opt}`) }}
              </div>
              <div class="text-xs text-textColor3 mt-0.5 text-pretty">
                {{ $t(`documentPage.command.dataTab.resend.${opt}Hint`) }}
              </div>
            </div>
          </label>
        </div>
      </n-radio-group>

      <n-alert v-if="mode === 'selected' && contentChanged" type="warning" :bordered="false">
        <template #icon>
          <n-icon><Warning20Regular /></n-icon>
        </template>
        {{ $t('documentPage.command.dataTab.resend.contentChanged') }}
      </n-alert>

      <div class="text-xs font-semibold uppercase tracking-wide text-textColor3">
        {{ $t('documentPage.command.dataTab.sectionSigners') }}
      </div>
      <div class="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
        <div
          v-for="row in rows"
          :key="row.key"
          class="flex items-center gap-3 rounded-xl border border-surface-line bg-surface-section px-3 py-2"
          :class="{ 'cursor-pointer': !isDisabled(row) }"
          @click="toggle(row, !isChecked(row))"
        >
          <n-checkbox
            :checked="isChecked(row)"
            :disabled="isDisabled(row)"
            @click.stop
            @update:checked="(v) => toggle(row, v)"
          />
          <div class="flex-1 min-w-0">
            <UIUser
              :short="false"
              :hide-tooltip="true"
              :data="{
                photo: row.photo,
                lastName: row.last_name,
                firstName: row.first_name,
                middleName: row.middle_name,
                position: row.type === 'w' ? typeLabel('w') : row.position || typeLabel(row.type)
              }"
            />
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <UIStatus fig compact :tooltip="false" :status="statusOf(row)" />
            <span v-if="row.forced && row.status !== null" class="text-[10px] text-textColor3">
              {{ $t('documentPage.command.dataTab.resend.required') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <span class="text-xs text-textColor3">
          {{ $t('documentPage.command.dataTab.resend.count', { count: resendCount }) }}
        </span>
        <div class="flex gap-2">
          <n-button :disabled="loading" @click="emits('update:visible', false)">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button type="primary" :loading="loading" :disabled="!resendCount" @click="onConfirm">
            <template #icon>
              <n-icon><Send20Regular /></n-icon>
            </template>
            {{ $t('documentPage.command.dataTab.resend.submit') }}
          </n-button>
        </div>
      </div>
    </template>
  </n-modal>
</template>
