<script setup>
  import { UIModal } from '@components'
  import RoleDepartmentsField from './RoleDepartmentsField.vue'
  import { confirmTransfer, departmentsPayload, departmentsValid } from './roleDepartments.js'

  // Mavjud HR yordamchisi / tabelchi rolining bo'limlarini tahrirlash (rolni qayta bermasdan).
  const props = defineProps({
    visible: { type: Boolean, default: false },
    userUuid: { type: String, default: null },
    selfWorkerUuid: { type: String, default: null },
    role: { type: String, default: null },
    roleLabel: { type: String, default: null },
    organization: { type: Object, default: null },
    value: { type: Object, default: null }
  })
  const emits = defineEmits(['update:visible', 'saved'])

  const model = ref({ whole: false, departments: [] })
  const conflicts = ref([])
  const saving = ref(false)

  watch(
    () => props.visible,
    (v) => {
      if (!v) return
      model.value = {
        whole: !!props.value?.whole,
        departments: (props.value?.departments ?? []).map((d) => d.id)
      }
    }
  )

  const canSave = computed(() => departmentsValid(props.role, model.value))

  const save = (transfer) => {
    saving.value = true
    $ApiService.workerService
      ._userRoleDepartments({
        data: {
          uuid: props.userUuid,
          role: props.role,
          organization_id: props.organization?.id,
          ...departmentsPayload(props.role, model.value),
          transfer
        }
      })
      .then(() => {
        emits('saved')
        emits('update:visible', false)
      })
      .finally(() => (saving.value = false))
  }

  const onSave = () => canSave.value && confirmTransfer(conflicts.value, save)
</script>

<template>
  <UIModal
    :width="520"
    :visible="visible"
    :title="$t('workerRole.dept.editTitle')"
    @update:visible="(v) => emits('update:visible', v)"
  >
    <div class="flex flex-col gap-4 text-sm">
      <div class="rounded-xl border border-surface-line px-3 py-2">
        <div class="font-medium">{{ roleLabel || role }}</div>
        <div class="text-xs text-textColor3">{{ organization?.name }}</div>
      </div>
      <RoleDepartmentsField
        v-model="model"
        :role="role"
        :organization-id="organization?.id"
        :self-worker-uuid="selfWorkerUuid"
        @conflicts="(v) => (conflicts = v)"
      />
      <div class="flex justify-end gap-3 pt-2">
        <n-button type="error" secondary @click="emits('update:visible', false)">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button type="primary" :disabled="!canSave" :loading="saving" @click="onSave">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </div>
  </UIModal>
</template>
