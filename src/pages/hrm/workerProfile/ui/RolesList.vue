<script setup>
  import { useWorkerProfileStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { UIBadge, UIMenuButton, UIModal } from '@/components/index.js'
  import { RibbonStar24Filled, AddCircle20Regular } from '@vicons/fluent'
  import { useRoute } from 'vue-router'
  import RoleForm from './RoleForm.vue'
  import RoleDepartmentsModal from '@/pages/hrm/worker/ui/RoleDepartmentsModal.vue'
  import { departmentsLabel } from '@/pages/hrm/worker/ui/roleDepartments.js'
  const route = useRoute()

  const store = useWorkerProfileStore()

  const onSelectEv = (v) => {
    if (v.key === Utils.ActionTypes.delete) {
      onDelete(v.data)
    }
  }

  const onDelete = (v) => {
    const id = route.query.id
    let data = {
      organization_id: v.id,
      role_id: v.roleId
    }
    store._deleteRole(data, id)
  }

  const onSetActive = (v) => {
    const id = route.query.id
    let data = {
      organization_id: v.id,
      role_id: v.roleId
    }
    store._setActiveRole(data, id)
  }

  // HR yordamchisi / tabelchi bo'limlarini tahrirlash.
  const edit = ref({ visible: false, item: null })
  const onEditDepartments = (item) => (edit.value = { visible: true, item })

  const onAdd = () => {
    store.roleSelfWorkerUuid = null
    store.rolePayload.role = null
    store.rolePayload.organization_id = []
    store.roleVisible = true
  }
</script>

<template>
  <div class="w-full grid grid-cols-12 border border-dashed rounded-2xl p-4">
    <div class="col-span-12 px-2 pt-2 flex justify-between items-center mb-1">
      <span class="font-medium">{{ $t('workerProfile.roles.title') }}</span>
      <n-button type="primary" @click="onAdd"
        >{{ $t('workerProfile.roles.attachRole') }}
        <template #icon>
          <AddCircle20Regular />
        </template>
      </n-button>
    </div>
    <div class="col-span-12 p-2 w-full overflow-x-auto">
      <n-table v-if="store.rolesList.length > 0" class="border-dashed" size="small">
        <tbody>
          <tr v-for="(item, idx) in store.rolesList" :key="idx">
            <td class="w-[40px] min-w-[40px]">
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td class="w-[40px] min-w-[200px]">
              <div class="flex items-center gap-2">
                <UIBadge :label="item?.roleName" :type="Utils.colorTypes.dark">
                  <template #icon>
                    <n-icon size="20">
                      <RibbonStar24Filled />
                    </n-icon>
                  </template>
                </UIBadge>
                <UIBadge
                  v-if="item?.active"
                  :show-icon="false"
                  :label="$t('workerProfile.roles.active')"
                  :type="Utils.colorTypes.info"
                />
              </div>
            </td>
            <td>
              <UIBadge :show-icon="false" :label="item?.name" :type="Utils.colorTypes.success" />
              <div v-if="item?.departments" class="mt-1 flex items-center gap-2 text-xs text-textColor2">
                <span class="line-clamp-2">{{ $t('workerRole.dept.title') }}: {{ departmentsLabel(item.departments) }}</span>
                <n-button size="tiny" quaternary type="primary" @click="onEditDepartments(item)">
                  {{ $t('content.edit') }}
                </n-button>
              </div>
            </td>
            <td class="w-[120px] min-w-[120px] text-right">
              <n-button
                v-if="!item?.active"
                size="tiny"
                secondary
                type="primary"
                @click="onSetActive(item)"
              >
                {{ $t('workerProfile.roles.setActive') }}
              </n-button>
            </td>
            <td class="w-[40px] min-w-[40px]">
              <UIMenuButton :data="item" @selectEv="onSelectEv" />
            </td>
          </tr>
        </tbody>
      </n-table>
      <div v-if="store.rolesList.length === 0 && !store.loading" class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </div>
    </div>

    <div class="col-span-12">
      <UIModal
        :width="600"
        :visible="store.roleVisible"
        @update:visible="(v) => (store.roleVisible = v)"
        :title="$t('content.attachment')"
      >
        <RoleForm />
      </UIModal>
      <RoleDepartmentsModal
        v-model:visible="edit.visible"
        :user-uuid="store.data?.profile?.uuid"
        :self-worker-uuid="route.query.id"
        :role="edit.item?.roleKey"
        :role-label="edit.item?.roleName"
        :organization="edit.item ? { id: edit.item.id, name: edit.item.name } : null"
        :value="edit.item?.departments"
        @saved="store._index()"
      />
    </div>
  </div>
</template>

<style scoped></style>
