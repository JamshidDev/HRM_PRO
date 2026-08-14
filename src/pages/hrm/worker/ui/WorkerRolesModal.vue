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
  import { Delete20Regular } from '@vicons/fluent'

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

  const canAttach = computed(
    () => !!store.rolePayload.role && store.rolePayload.organization_id.length > 0
  )

  const onAttach = () => {
    if (!canAttach.value) return
    store._attachWorkerRole()
  }

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
      <div class="col-span-5">
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
      <div class="col-span-5">
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
      <div class="col-span-2">
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

    <!-- Joriy rollar -->
    <n-spin :show="store.rolesLoading">
      <div class="flex flex-col gap-2 py-4 min-h-[120px]">
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
          </div>
          <!-- Faol rol — effektiv ruxsat manbai (har userda bittasi). -->
          <n-tag v-if="row.is_active" type="success" size="small" round>
            {{ $t('content.active') }}
          </n-tag>
          <n-popconfirm @positive-click="store._detachWorkerRole(row)">
            <template #trigger>
              <n-button
                size="small"
                type="error"
                ghost
                :disabled="!canDetach"
                :loading="store.rolesSaving"
              >
                <template #icon>
                  <n-icon><Delete20Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{ $t('content.confirmDelete') }}
          </n-popconfirm>
        </div>
      </div>
    </n-spin>

    <div class="flex justify-end">
      <n-button @click="store.rolesVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
    </div>
  </UIModal>
</template>
