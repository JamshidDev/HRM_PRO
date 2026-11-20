<script setup>
  import { computed } from 'vue'
  import { useUserRoleStore } from '@/store/modules/index.js'
  import { Warning16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import {
    SCOPE_LEVELS,
    SCOPE_TYPES,
    isDeptScopedPermission,
    permissionGroupPrefix
  } from '../roleScope.js'
  import { PERMISSION_GROUPS } from '@/utils/permissionGroups.js'

  // Doira: kesim + doira turi select'lari; kesim almashganda ruxsat tozalash tasdig'i.
  const { t } = i18n.global
  const store = useUserRoleStore()

  const levelOptions = computed(() =>
    SCOPE_LEVELS.map((value) => ({ value, label: t(`userRole.form.level_${value}`) }))
  )

  // Bo'linma kesimiga o'tishda olib tashlanadigan tanlangan ruxsatlar.
  const incompatibleIds = () => {
    const byId = new Map((store.originAllPermissionList || []).map((p) => [p.id, p.name]))
    return store.payload.permissions.filter((id) => {
      const name = byId.get(id)
      return name != null && !isDeptScopedPermission(name)
    })
  }

  const level = computed({
    get: () => store.pendingLevel?.level ?? store.payload.scope_level,
    set: (v) => store.setScopeLevel(v, v === 'department' ? incompatibleIds() : [])
  })

  const typeOptions = computed(() =>
    (SCOPE_TYPES[store.payload.scope_level] ?? []).map((value) => ({
      value,
      label: t(`userRole.form.scope_${value}`)
    }))
  )

  // Tasdiqda olib tashlanadigan guruh nomlari.
  const pendingGroups = computed(() => {
    if (!store.pendingLevel) return []
    const byId = new Map((store.originAllPermissionList || []).map((p) => [p.id, p.name]))
    const labels = new Map()
    for (const m of PERMISSION_GROUPS) for (const g of m.groups) labels.set(g.prefix, g.label)
    const names = new Set()
    for (const id of store.pendingLevel.ids) {
      const prefix = permissionGroupPrefix(byId.get(id) ?? '')
      names.add(prefix && labels.has(prefix) ? t(labels.get(prefix)) : byId.get(id))
    }
    return [...names]
  })
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
    <n-form-item :label="$t('userRole.form.scopeLevel')">
      <n-select v-model:value="level" :options="levelOptions" />
    </n-form-item>
    <n-form-item :label="$t('userRole.form.scopeKind')">
      <n-select v-model:value="store.payload.scope_type" :options="typeOptions" />
    </n-form-item>

    <div v-if="store.pendingLevel" class="md:col-span-2 scope-warn">
      <div class="flex gap-2">
        <n-icon size="16" class="mt-0.5 flex-none"><Warning16Regular /></n-icon>
        <span>
          <b>{{ $t('userRole.form.pruneTitle', { n: store.pendingLevel.ids.length }) }}</b>
          {{ $t('userRole.form.pruneBody') }} {{ pendingGroups.join(', ') }}.
        </span>
      </div>
      <div class="flex gap-2 justify-end">
        <n-button size="small" @click="store.cancelPendingLevel()">{{
          $t('content.cancel')
        }}</n-button>
        <n-button size="small" type="primary" @click="store.confirmPendingLevel()">
          {{ $t('userRole.form.pruneConfirm') }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .scope-warn {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--warning-color, #f79009) 45%, transparent);
    background: color-mix(in srgb, var(--warning-color, #f79009) 10%, transparent);
  }
</style>
