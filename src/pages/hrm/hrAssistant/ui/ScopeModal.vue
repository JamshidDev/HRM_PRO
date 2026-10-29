<script setup>
  import { UIModal } from '@/components/index.js'
  import { useHrAssistantStore } from '@/store/modules/index.js'
  import DepartmentTreeFilter from '@/pages/hrm/worker/ui/DepartmentTreeFilter.vue'

  // Doira: «Butun korxona» yoki «Qisman» — qisman bo'lsa bo'limlar tanlanadi (pastki bo'limlari bilan).
  const store = useHrAssistantStore()
  const canSave = computed(() => store.payload.whole || store.payload.departments.length > 0)
</script>

<template>
  <UIModal v-model:visible="store.visible" :width="520" :title="$t('hrAssistantPage.scopeTitle')">
    <div v-if="store.selected" class="flex flex-col gap-4 text-sm">
      <div class="rounded-xl border border-surface-line px-3 py-2">
        <div class="font-medium">
          {{ [store.selected.worker?.last_name, store.selected.worker?.first_name, store.selected.worker?.middle_name].filter(Boolean).join(' ') }}
        </div>
        <div class="text-xs text-secondary">{{ store.selected.organization?.name }}</div>
      </div>

      <n-radio-group v-model:value="store.payload.whole" class="grid grid-cols-2 gap-2">
        <n-radio :value="true" class="border border-surface-line rounded-lg px-3 py-2">
          {{ $t('hrAssistantPage.whole') }}
        </n-radio>
        <n-radio :value="false" class="border border-surface-line rounded-lg px-3 py-2">
          {{ $t('hrAssistantPage.partial') }}
        </n-radio>
      </n-radio-group>

      <template v-if="!store.payload.whole">
        <DepartmentTreeFilter
          v-model="store.payload.departments"
          :organization-id="store.selected.organization?.id"
        />
        <div class="text-xs text-secondary">{{ $t('hrAssistantPage.partialHint') }}</div>
      </template>

      <div class="flex justify-end gap-3 pt-2">
        <n-button type="error" secondary @click="store.visible = false">{{ $t('content.cancel') }}</n-button>
        <n-button type="primary" :disabled="!canSave" :loading="store.saveLoading" @click="store._save()">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
