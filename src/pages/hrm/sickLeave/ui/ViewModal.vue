<script setup>
  import { UIStatus } from '@/components/index.js'
  import { useSickLeaveStore, SICK_LEAVE_CLOSE_TYPE } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { DocumentPdf24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useSickLeaveStore()

  const row = computed(() => store.viewRow ?? {})
  const isOpen = computed(() => !row.value.to_date)
  const withDocument = computed(() => row.value.close_type === SICK_LEAVE_CLOSE_TYPE.withDocument)

  const statusOf = computed(() => {
    if (isOpen.value) return { name: t('sickLeave.status.open'), id: 1 }
    if (row.value.close_type === SICK_LEAVE_CLOSE_TYPE.unexcused) {
      return { name: t('sickLeave.status.unexcused'), id: 4 }
    }
    return { name: t('sickLeave.status.closed'), id: 3 }
  })

  const fullName = computed(() =>
    [row.value.worker?.last_name, row.value.worker?.first_name, row.value.worker?.middle_name]
      .filter(Boolean)
      .join(' ')
  )

  const openFile = () => window.open(row.value.file, '_blank')
</script>

<template>
  <div class="flex flex-col gap-3 px-1">
    <!-- Xodim va holat -->
    <div class="rounded-xl border border-fig-br-secondary bg-fig-block p-3">
      <p class="text-[14px] font-medium text-fig-text-primary">{{ fullName }}</p>
      <p class="text-[12px] text-fig-text-tertiary">{{ row.position }}</p>
      <p class="mt-1 text-[12px] text-fig-text-muted">{{ row.organization?.name }}</p>
      <div class="mt-2"><UIStatus :status="statusOf" /></div>
    </div>

    <!-- Sanalar -->
    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-xl border border-fig-br-secondary p-3">
        <p class="text-[11px] text-fig-text-muted">{{ $t('sickLeave.form.fromDate') }}</p>
        <p class="text-[14px] font-medium text-fig-text-primary">
          {{ Utils.timeOnlyDate(row.from_date) }}
        </p>
      </div>
      <div class="rounded-xl border border-fig-br-secondary p-3">
        <p class="text-[11px] text-fig-text-muted">{{ $t('sickLeave.form.toDate') }}</p>
        <p class="text-[14px] font-medium text-fig-text-primary">
          {{ isOpen ? $t('sickLeave.view.stillOpen') : Utils.timeOnlyDate(row.to_date) }}
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-1 text-[12px]">
      <div class="flex justify-between gap-2">
        <span class="text-fig-text-muted">{{ $t('sickLeave.view.days') }}</span>
        <span class="text-fig-text-primary">{{ row.days }} {{ $t('sickLeave.view.daysUnit') }}</span>
      </div>
      <div class="flex justify-between gap-2">
        <span class="text-fig-text-muted">{{ $t('sickLeave.view.openedAt') }}</span>
        <span class="text-fig-text-primary">{{ Utils.timeOnlyDate(row.created_at) }}</span>
      </div>
      <div v-if="row.closed_at" class="flex justify-between gap-2">
        <span class="text-fig-text-muted">{{ $t('sickLeave.view.closedAt') }}</span>
        <span class="text-fig-text-primary">{{ Utils.timeOnlyDate(row.closed_at) }}</span>
      </div>
    </div>

    <!-- Hujjat yoki sabab -->
    <div v-if="!isOpen" class="rounded-xl border border-fig-br-secondary p-3">
      <p class="mb-2 text-[12px] font-medium text-fig-text-tertiary">
        {{ $t('sickLeave.view.docTitle') }}
      </p>

      <template v-if="withDocument">
        <div class="flex flex-col gap-1 text-[12px]">
          <div class="flex justify-between gap-2">
            <span class="text-fig-text-muted">{{ $t('sickLeave.view.number') }}</span>
            <span class="text-fig-text-primary">{{ row.number }}</span>
          </div>
          <div class="flex justify-between gap-2">
            <span class="text-fig-text-muted">{{ $t('sickLeave.view.issuedDate') }}</span>
            <span class="text-fig-text-primary">{{ Utils.timeOnlyDate(row.issued_date) }}</span>
          </div>
        </div>
        <n-button v-if="row.file" class="mt-3" block size="small" @click="openFile">
          <template #icon><n-icon :component="DocumentPdf24Regular" /></template>
          {{ $t('sickLeave.view.openFile') }}
        </n-button>
      </template>

      <template v-else>
        <p class="text-[12px] text-fig-text-muted">{{ $t('sickLeave.view.noDoc') }}</p>
        <p class="mt-1 text-[13px] text-fig-text-primary">{{ row.close_reason }}</p>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
