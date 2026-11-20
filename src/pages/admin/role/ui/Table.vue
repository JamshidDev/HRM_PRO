<script setup>
  import { UIBadge, UITable } from '@/components/index.js'
  import { useAccountStore, useUserRoleStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Edit32Regular, RibbonStar24Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { useEimzoGate } from './useEimzoGate.js'
  import { fromApiRole, isAdminOnlyScope } from '../roleScope.js'

  const { t } = i18n.global
  const accStore = useAccountStore()
  const store = useUserRoleStore()
  const gate = useEimzoGate()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.rolesWrite)) return
    store.visibleType = false
    store.elementId = row.id
    // Rol guard'i — permission olamini belgilaydi; shu guard bo'yicha ro'yxat qayta yuklanadi.
    store.payload.guard_name = row.guard_name || 'sanctum'
    const r = fromApiRole(row)
    store.payload.key = r.key
    store.payload.name = r.name
    const integration = store.payload.guard_name === 'integration'
    store.payload.scope_level = integration ? null : r.scope_level
    store.payload.scope_type = integration ? null : r.scope_type
    store.pendingLevel = null
    store.formTab = 'settings'
    store.payload.permissions = row.permissions.map((x) => x.id)
    store.query = null
    store._getAllPermission()
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.rolesDelete)) return
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
      title: 'Guard',
      minWidth: 120,
      width: 140
    },
    {
      key: 'scope_type',
      title: t('userRole.form.scopeKind'),
      minWidth: 220,
      width: 260
    },
    // E-IMZO ozodligi — faqat Admin'ga (endpoint 403 bersa ustun yo'q).
    ...(gate.available.value
      ? [{ key: 'eimzo_exempt', title: 'E-imzo', width: 90 }]
      : [])
  ])

  // Doira yorliqlari: kesim + tur; faqat Admin beradigan keng doira — qizil.
  const scopeOf = (row) => (row.guard_name === 'integration' ? null : fromApiRole(row))
  const scopeTagType = (s) => (isAdminOnlyScope(s.scope_level, s.scope_type) ? 'error' : 'info')

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
    permission-prefix="roles"
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

    <!-- Doira: kesim + tur yorliqlari; integration → "—". -->
    <template #cell-scope_type="{ row }">
      <div v-if="scopeOf(row)" class="flex gap-1 flex-wrap">
        <n-tag size="small" round>
          {{ t(`userRole.form.level_${scopeOf(row).scope_level}`) }}
        </n-tag>
        <n-tag size="small" round :type="scopeTagType(scopeOf(row))">
          {{ t(`userRole.form.scope_${scopeOf(row).scope_type}`) }}
        </n-tag>
      </div>
      <span v-else class="text-gray-400">—</span>
    </template>

    <!-- Iqtisod bo'limiga E-IMZO tasdig'isiz kirish (faqat sanctum rollar). -->
    <template #cell-eimzo_exempt="{ row }">
      <div
        v-if="gate.exemptById.value[row.id]"
        class="flex items-center"
        :title="gate.exemptById.value[row.id].locked ? t('eimzoGateAdmin.adminLocked') : ''"
        @click.stop
      >
        <n-switch
          size="small"
          :value="gate.exemptById.value[row.id].exempt"
          :disabled="gate.exemptById.value[row.id].locked || !gate.enabled.value"
          :loading="gate.savingId.value === row.id"
          @update:value="(v) => gate.setExempt(row.id, v)"
        />
      </div>
    </template>
  </UITable>
</template>
