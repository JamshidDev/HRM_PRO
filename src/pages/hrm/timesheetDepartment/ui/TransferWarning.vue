<script setup>
  import { useTimesheetDepartmentStore } from '@/store/modules/index.js'
  import { Warning16Regular } from '@vicons/fluent'

  const store = useTimesheetDepartmentStore()
  const holder = (k) => [k.last_name, k.first_name, k.middle_name].filter(Boolean).join(' ')
</script>

<template>
  <!-- Tanlangan bo'limlardan boshqa tabelchidagilari: tasdiqlansa undan olinadi. -->
  <div
    v-if="store.transferConflicts.length"
    class="mb-3 rounded-lg border border-warning/40 bg-warning/10 p-2 text-xs leading-[1.4]"
  >
    <div class="mb-1 flex items-center gap-1 font-medium text-warning">
      <n-icon :size="16"><Warning16Regular /></n-icon>
      {{ $t('timesheetWorkerPage.transfer_title') }}
    </div>
    <ul class="mb-1 list-disc pl-5">
      <li v-for="d in store.transferConflicts" :key="d.id">
        {{
          $t('timesheetWorkerPage.transfer_item', {
            department: d.name,
            from: d.others.map(holder).join(', ')
          })
        }}
      </li>
    </ul>
    <div class="text-secondary">
      {{ $t('timesheetWorkerPage.transfer_hint', { to: store.targetWorkerName || '—' }) }}
    </div>
  </div>
</template>
