<script setup>
  import { NoDataPicture } from '@/components/index.js'
  import { useStructureReportStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const props = defineProps({
    organizationId: {
      type: [Number, String],
      required: true
    }
  })

  const store = useStructureReportStore()

  const contracts = computed(() => {
    const orgData = store.reportData.find((v) => String(v.organization_id) === String(props.organizationId))
    return orgData?.contracts || []
  })
</script>

<template>
  <div v-if="contracts.length > 0" class="w-full overflow-auto max-h-[calc(85vh-280px)] flex flex-col gap-3 pr-1">
    <div
      v-for="(item, idx) in contracts"
      :key="item.id"
      class="contract-card"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold bg-primary/10 text-primary rounded-md px-2 py-0.5">{{ idx + 1 }}</span>
          <span class="text-sm font-semibold text-textColor0">{{ item.full_name }}</span>
        </div>
        <span v-if="item.type" class="text-[11px] font-medium bg-primary/10 text-primary rounded-full px-2.5 py-0.5">{{ item.type }}</span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mb-3">
        <div class="flex flex-col">
          <span class="contract-label">{{ $t('structureReport.position') }}</span>
          <span class="contract-value">{{ item.position_name || '—' }}</span>
        </div>
        <div class="flex flex-col">
          <span class="contract-label">{{ $t('structureReport.organization') }}</span>
          <span class="contract-value">{{ item.organization || '—' }}</span>
        </div>
        <div class="flex flex-col">
          <span class="contract-label">{{ $t('structureReport.birthday') }}</span>
          <span class="contract-value">{{ item.birthday || '—' }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="contract-label">{{ $t('structureReport.education') }}</label>
          <n-input
            v-model:value="item.educations"
            size="small"
            :placeholder="$t('structureReport.education')"
            :status="!item.educations ? 'warning' : undefined"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="contract-label">{{ $t('structureReport.oldOrganization') }}</label>
          <n-input
            v-model:value="item.old_organization_name"
            size="small"
            :placeholder="$t('structureReport.oldOrganization')"
            :status="!item.old_organization_name ? 'warning' : undefined"
          />
        </div>
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 w-1/4">
            <label class="contract-label">{{ $t('structureReport.oldPositionDate') }}</label>
            <n-date-picker
              v-model:value="item.old_position_date"
              type="date"
              size="small"
              class="w-full"
              :format="useAppSetting.datePicketFormat"
              clearable
              :status="!item.old_position_date ? 'warning' : undefined"
            />
          </div>
          <div class="flex flex-col gap-1 w-3/4">
            <label class="contract-label">{{ $t('structureReport.oldPosition') }}</label>
            <n-input
              v-model:value="item.old_position_name"
              size="small"
              :placeholder="$t('structureReport.oldPosition')"
              :status="!item.old_position_name ? 'warning' : undefined"
            />
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 w-1/4">
            <label class="contract-label">{{ $t('structureReport.commandNumber') }}</label>
            <n-input
              v-model:value="item.command"
              size="small"
              :placeholder="$t('structureReport.commandNumber')"
              :status="!item.command ? 'warning' : undefined"
            />
          </div>
          <div class="flex flex-col gap-1 w-3/4">
            <label class="contract-label">{{ $t('structureReport.commandReason') }}</label>
            <n-input
              v-model:value="item.command_reason"
              size="small"
              :placeholder="$t('structureReport.commandReason')"
              :status="!item.command_reason ? 'warning' : undefined"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <NoDataPicture v-else />
</template>

<style scoped>
.contract-card {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--surface-line);
  background: var(--surface-section);
}

.contract-label {
  font-size: 11px;
  color: var(--textColor3);
  font-weight: 500;
}

.contract-value {
  font-size: 13px;
  color: var(--textColor0);
  line-height: 1.3;
}
</style>
