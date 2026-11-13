<script setup>
  /**
   * «Xodimlar» menyusidagi «Rollar» — biriktirish va olib tashlash BITTA oynada.
   *
   * Header: rol + korxona tanlab «Biriktirish».
   * Tana:   xodimning joriy (rol, korxona) juftliklari, har birida o'chirish.
   *
   * Backend: GET `/hr/worker-positions/{uuid}/roles` (o'qish),
   * `edit/attach-role` va `edit/detach-role` (hr-workers-write).
   */
  import { UIModal, UISelect } from '@components'
  import { useAccountStore, useComponentStore, useWorkerStore } from '@stores'
  import { Delete20Regular, Edit20Regular } from '@vicons/fluent'
  import RoleDepartmentsField from './RoleDepartmentsField.vue'
  import RoleDepartmentsModal from './RoleDepartmentsModal.vue'
  import {
    confirmTransfer,
    departmentsLabel,
    departmentsPayload,
    departmentsValid,
    emptyDepartments,
    isDepartmentRole
  } from './roleDepartments.js'
  import { confirmDelete } from '@/components/notify/alertDialog.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useWorkerStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  // O'chirish alohida ruxsat (`hr-users-detach-role`) — biriktirishdan ajratilgan.
  const canDetach = computed(() => accStore.checkPermission(accStore.pn.hrUsersDetachRole))

  // Modal ochilganda: rollar ro'yxati + dropdown manbalari.
  watch(
    () => store.rolesVisible,
    (v) => {
      if (!v) return
      store.rolePayload.role = null
      store.rolePayload.organization_id = []
      store.roleStructureCheck = []
      store._workerRoles()
      if (componentStore.roles.length === 0) componentStore._enums()
      if (componentStore.structureList.length === 0) componentStore._structures()
    }
  )

  // HR yordamchisi / tabelchi — bo'limlar rol bilan birga tanlanadi.
  const dept = ref(emptyDepartments())
  const conflicts = ref([])
  const orgId = computed(() => Number(store.rolePayload.organization_id?.[0]?.id) || null)
  watch(
    () => [store.rolePayload.role, orgId.value],
    () => (dept.value = emptyDepartments())
  )

  const canAttach = computed(
    () =>
      !!store.rolePayload.role &&
      store.rolePayload.organization_id.length > 0 &&
      departmentsValid(store.rolePayload.role, dept.value)
  )

  const onAttach = () => {
    if (!canAttach.value) return
    confirmTransfer(conflicts.value, (transfer) =>
      store._attachWorkerRole({ ...departmentsPayload(store.rolePayload.role, dept.value), transfer })
    )
  }

  // Bo'limlarni tahrirlash oynasi.
  // Rolni uzish — loyihaning umumiy o'chirish tasdig'i.
  const askDetach = (row) =>
    confirmDelete({
      message: [t('content.confirmDelete'), row.departments ? t('workerRole.dept.detachWarn') : '']
        .filter(Boolean)
        .join('\n'),
      onConfirm: () => store._detachWorkerRole(row)
    })

  const edit = ref({ visible: false, row: null })
  const onEditDepartments = (row) => (edit.value = { visible: true, row })

  // Backend rolning XOM nomini qaytaradi ('Finance'), ro'yxatda esa tarjima
  // ko'rsatiladi ('Buxgalter') — dropdown bilan bir xil ko'rinsin.
  const roleLabel = (rawName) =>
    componentStore.roles.find((r) => r.id === rawName)?.name || rawName
</script>

<template>
  <UIModal
    :width="560"
    :visible="store.rolesVisible"
    @update:visible="(v) => (store.rolesVisible = v)"
    :title="$t('workerRole.attachRole')"
  >
    <!-- Header: rol + korxona tanlab biriktirish -->
    <div class="grid grid-cols-12 gap-3 items-end pb-4 border-b border-surface-line">
      <div class="col-span-12 md:col-span-5">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('workerRole.from.role') }}</label>
        <n-select
          v-model:value="store.rolePayload.role"
          :options="componentStore.roles"
          label-field="name"
          value-field="id"
          filterable
          clearable
          :placeholder="$t('content.choose')"
        />
      </div>
      <div class="col-span-12 md:col-span-5">
        <label class="text-xs text-textColor3 mb-1 block">{{
          $t('documentPage.form.organization')
        }}</label>
        <UISelect
          :multiple="false"
          :options="componentStore.structureList"
          :model-v="store.rolePayload.organization_id"
          :checked-val="store.roleStructureCheck"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @updateModel="(v) => (store.rolePayload.organization_id = v)"
          @updateCheck="(v) => (store.roleStructureCheck = v)"
          @onSearch="componentStore._structures"
        />
      </div>
      <div v-if="isDepartmentRole(store.rolePayload.role)" class="col-span-12 order-last">
        <RoleDepartmentsField
          v-model="dept"
          :role="store.rolePayload.role"
          :organization-id="orgId"
          :self-worker-uuid="store.rolesWorkerUuid"
          @conflicts="(v) => (conflicts = v)"
        />
      </div>
      <div class="col-span-12 md:col-span-2">
        <n-button
          class="w-full"
          type="primary"
          :disabled="!canAttach"
          :loading="store.rolesSaving"
          @click="onAttach"
        >
          {{ $t('content.add') }}
        </n-button>
      </div>
    </div>

    <!-- Joriy rollar — balandlik CHEKLANGAN, ro'yxat ichida scroll. Aks holda rol
         ko'paygan sari modal cho'zilib ketardi. `h-` emas `max-h-`: bitta rol
         bo'lganda telefon ekranining yarmi behuda ketmasin. -->
    <n-spin :show="store.rolesLoading" class="w-full">
      <div class="flex flex-col gap-2 my-4 max-h-[280px] min-h-[120px] overflow-y-auto pr-1">
        <div
          v-if="!store.rolesList.length && !store.rolesLoading"
          class="text-center text-sm text-textColor3 py-6"
        >
          {{ $t('content.notFoundData') }}
        </div>
        <div
          v-for="(row, i) in store.rolesList"
          :key="`${row.id}-${row.organization?.id}-${i}`"
          class="flex items-center gap-3 rounded-md border border-surface-line px-3 py-2"
        >
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate font-medium">{{ roleLabel(row.name) }}</span>
            <span class="truncate text-xs text-textColor3">
              {{ row.organization?.name || '—' }}
            </span>
            <span v-if="row.departments" class="text-xs text-textColor2 line-clamp-2">
              {{ $t('workerRole.dept.title') }}: {{ departmentsLabel(row.departments) }}
            </span>
          </div>
          <n-tooltip v-if="row.departments" trigger="hover">
            <template #trigger>
              <n-button size="small" ghost :aria-label="$t('workerRole.dept.editTitle')" @click="onEditDepartments(row)">
                <template #icon>
                  <n-icon><Edit20Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('workerRole.dept.editTitle') }}
          </n-tooltip>
          <!-- Faol rol — effektiv ruxsat manbai (har userda bittasi). -->
          <n-tag v-if="row.is_active" type="success" size="small" round>
            {{ $t('content.active') }}
          </n-tag>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button
                size="small"
                type="error"
                ghost
                :disabled="!canDetach"
                :loading="store.rolesSaving"
                :aria-label="$t('workerRole.detachRole')"
                @click="askDetach(row)"
              >
                <template #icon>
                  <n-icon><Delete20Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('workerRole.detachRole') }}
          </n-tooltip>
        </div>
      </div>
    </n-spin>

    <div class="flex justify-end">
      <n-button @click="store.rolesVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
    </div>
  </UIModal>
  <RoleDepartmentsModal
    v-model:visible="edit.visible"
    :user-uuid="store.rolesUserUuid"
    :self-worker-uuid="store.rolesWorkerUuid"
    :role="edit.row?.name"
    :role-label="roleLabel(edit.row?.name)"
    :organization="edit.row?.organization"
    :value="edit.row?.departments"
    @saved="store._workerRoles()"
  />
</template>
