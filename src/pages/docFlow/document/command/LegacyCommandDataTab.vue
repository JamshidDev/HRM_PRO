<script setup>
  // Ro'yxatdan o'tkazilgan buyruq ma'lumotlari — faqat o'qish (tahrirlash yo'q).
  import { DocumentCheckmark20Regular } from '@vicons/fluent'
  import { usePdfViewerStore } from '@/store/modules/index.js'

  const store = usePdfViewerStore()

  const info = computed(() => store.document?.document?.legacy || {})
  const workers = computed(() =>
    (store.confirmations || [])
      .filter((v) => v.type === 'w' && v.worker)
      .map((v) => ({
        id: v.id,
        name: [v.worker.last_name, v.worker.first_name, v.worker.middle_name]
          .filter(Boolean)
          .join(' '),
        position: v.position
      }))
  )

  const formatDate = (v) => (v ? v.split('-').reverse().join('.') : '—')

  const rows = computed(() => [
    { label: 'documentPage.command.form.command_number', value: info.value.command_number || '—' },
    { label: 'documentPage.command.form.command_date', value: formatDate(info.value.command_date) },
    { label: 'documentPage.command.form.type', value: info.value.type?.name || '—' },
    { label: 'documentPage.form.organization', value: info.value.organization || '—' },
    ...(info.value.award ? [{ label: 'commandPage.legacy.award', value: info.value.award }] : [])
  ])
</script>

<template>
  <div class="h-full overflow-y-auto p-4">
    <div class="mx-auto flex max-w-[720px] flex-col gap-3">
      <div
        class="flex items-center gap-2 rounded-md border border-surface-line border-dashed bg-surface-ground p-2.5"
      >
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fig-chip-brand text-primary"
        >
          <n-icon size="16"><DocumentCheckmark20Regular /></n-icon>
        </span>
        <div class="min-w-0">
          <div class="text-sm font-medium leading-5 text-textColor1">
            {{ $t('commandPage.legacy.viewerTitle') }}
          </div>
          <div class="text-xs leading-4 text-textColor2">
            {{ $t('commandPage.legacy.viewerSub') }}
          </div>
        </div>
      </div>

      <div
        class="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-surface-line bg-surface-section p-3"
      >
        <div v-for="row in rows" :key="row.label" class="min-w-0">
          <div class="text-xs leading-4 text-textColor2">{{ $t(row.label) }}</div>
          <div class="mt-0.5 text-sm font-medium leading-5 text-textColor1 break-words">
            {{ row.value }}
          </div>
        </div>
      </div>

      <div class="rounded-md border border-surface-line bg-surface-section p-3">
        <div class="mb-2 text-xs leading-4 text-textColor2">
          {{ $t('content.worker') }} · {{ workers.length }}
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="w in workers" :key="w.id" class="min-w-0">
            <div class="truncate text-sm font-medium leading-5 text-textColor1">{{ w.name }}</div>
            <div v-if="w.position" class="truncate text-xs leading-4 text-textColor2">
              {{ w.position }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
