<script setup>
  import { UIDepartmentSelect } from '@/components/index.js'
  import { HR_ASSISTANT_ROLE, TIMEKEEPER_ROLE, isDepartmentRole, timekeeperConflicts } from './roleDepartments.js'

  // Rolga qarab bo'lim tanlash: HR yordamchisi — butun/qisman, tabelchi — bo'limlar + band ogohlantirishi.
  const props = defineProps({
    role: { type: String, default: null },
    organizationId: { type: Number, default: null },
    modelValue: { type: Object, default: () => ({ whole: false, departments: [] }) },
    selfWorkerUuid: { type: String, default: null }
  })
  const emits = defineEmits(['update:modelValue', 'conflicts'])

  const holders = ref([])
  const nodes = ref({})

  const set = (patch) => emits('update:modelValue', { ...props.modelValue, ...patch })

  const loadHolders = async () => {
    holders.value = []
    if (props.role !== TIMEKEEPER_ROLE || !props.organizationId) return
    const res = await $ApiService.workerService._timekeepers({ params: { organization_id: props.organizationId } })
    holders.value = res.data.data ?? []
  }
  watch(() => [props.role, props.organizationId], loadHolders, { immediate: true })

  const onNodes = (list) => list.forEach((n) => (nodes.value[n.id] = n))

  const conflicts = computed(() =>
    props.role === TIMEKEEPER_ROLE
      ? timekeeperConflicts(props.modelValue.departments ?? [], holders.value, nodes.value, props.selfWorkerUuid)
      : []
  )
  watch(conflicts, (v) => emits('conflicts', v), { immediate: true })
</script>

<template>
  <div v-if="isDepartmentRole(role)" class="flex flex-col gap-2">
    <label class="text-xs text-textColor3">{{ $t('workerRole.dept.title') }}</label>

    <n-radio-group
      v-if="role === HR_ASSISTANT_ROLE"
      :value="!!modelValue.whole"
      class="grid grid-cols-2 gap-2"
      @update:value="(v) => set({ whole: v })"
    >
      <n-radio :value="true" class="border border-surface-line rounded-lg px-3 py-2">
        {{ $t('workerRole.dept.whole') }}
      </n-radio>
      <n-radio :value="false" class="border border-surface-line rounded-lg px-3 py-2">
        {{ $t('workerRole.dept.partial') }}
      </n-radio>
    </n-radio-group>

    <template v-if="role === TIMEKEEPER_ROLE || !modelValue.whole">
      <UIDepartmentSelect
        :model-value="modelValue.departments ?? []"
        :organization="organizationId"
        multiple
        own
        @update:model-value="(v) => set({ departments: v })"
        @change="onNodes"
      />
      <div class="text-xs text-textColor3">
        {{ role === HR_ASSISTANT_ROLE ? $t('workerRole.dept.assistantHint') : $t('workerRole.dept.timekeeperHint') }}
      </div>
    </template>

    <div v-if="conflicts.length" class="rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-xs text-warning">
      <div class="font-medium mb-1">{{ $t('workerRole.dept.transferTitle') }}</div>
      <div v-for="c in conflicts" :key="c.id">«{{ c.name }}» — {{ c.holders }}</div>
    </div>
  </div>
</template>
