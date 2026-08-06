<script setup>
  import { UIBadge, UITable } from '@/components/index.js'
  import { useAccountStore, useUserRoleStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular, RibbonStar24Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = useUserRoleStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.rolesWrite)) return
    store.visibleType = false
    store.elementId = row.id
    store.payload.name = row.name
    // Rol guard'i — permission olamini belgilaydi; shu guard bo'yicha ro'yxat qayta yuklanadi.
    store.payload.guard_name = row.guard_name || 'sanctum'
    store.payload.permissions = row.permissions.map((x) => x.id)
    store.query = null
    store._getAllPermission()
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.rolesWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('content.name'),
      minWidth: 200
    },
    {
      key: 'guard_name',
      title: t('userRole.form.type'),
      minWidth: 120,
      width: 140
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="admin-role"
    @change-page="changePage"
  >
    <template #cell-name="{ row }">
      <div class="inline-block">
        <UIBadge :label="row.name" :type="Utils.colorTypes.dark">
          <template #icon>
            <n-icon size="20">
              <RibbonStar24Filled />
            </n-icon>
          </template>
        </UIBadge>
      </div>
    </template>

    <template #cell-guard_name="{ row }">
      <n-tag size="small" round :type="row.guard_name === 'integration' ? 'warning' : 'default'">
        {{
          row.guard_name === 'integration'
            ? t('userRole.form.typeIntegration')
            : t('userRole.form.typeSanctum')
        }}
      </n-tag>
    </template>
  </UITable>
</template>
