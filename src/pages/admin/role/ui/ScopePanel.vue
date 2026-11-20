<script setup>
  import { computed } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useUserRoleStore } from '@/store/modules/index.js'
  import { Info16Regular, Warning16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import {
    SCOPE_LEVELS,
    SCOPE_TYPES,
    isDeptScopedPermission,
    permissionGroupPrefix
  } from '../roleScope.js'
  import { PERMISSION_GROUPS } from '@/utils/permissionGroups.js'

  // Doira: kesim + doira turi select'lari; kesim almashganda ruxsat tozalash tasdig'i (alohida oynada).
  const { t } = i18n.global
  const store = useUserRoleStore()
  defineProps({ disabled: { type: Boolean, default: false } })

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
    get: () => store.payload.scope_level,
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
  <!-- Integration: doira o'rnida izoh, balandlik ikki maydonniki bilan bir xil. -->
  <div v-if="disabled" class="h-[166px] flex items-center justify-center pb-4">
    <div class="flex items-start gap-2 rounded-lg px-3 py-2 text-sm scope-info">
      <n-icon size="18" class="mt-0.5 flex-none"><Info16Regular /></n-icon>
      <span>{{ $t('userRole.form.integrationScopeInfo') }}</span>
    </div>
  </div>
  <div v-else class="grid grid-cols-1">
    <n-form-item :label="$t('userRole.form.scopeLevel')">
      <n-select v-model:value="level" :options="levelOptions" />
    </n-form-item>
    <n-form-item :label="$t('userRole.form.scopeKind')">
      <n-select v-model:value="store.payload.scope_type" :options="typeOptions" />
    </n-form-item>
  </div>

  <UIModal
    :visible="!!store.pendingLevel"
    :width="460"
    :title="$t('userRole.form.pruneTitle', { n: store.pendingLevel?.ids.length ?? 0 })"
    @update:visible="(v) => !v && store.cancelPendingLevel()"
  >
    <div class="flex gap-2 text-sm">
      <n-icon size="18" class="mt-0.5 flex-none text-warning"><Warning16Regular /></n-icon>
      <span>{{ $t('userRole.form.pruneBody') }} {{ pendingGroups.join(', ') }}.</span>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-3">
        <n-button class="w-[130px]" @click="store.cancelPendingLevel()">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button type="primary" class="w-[130px]" @click="store.confirmPendingLevel()">
          {{ $t('userRole.form.pruneConfirm') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>

<style scoped>
  .scope-info {
    background: var(--fig-chip-brand-bg);
    color: var(--fig-chip-brand-text);
  }
</style>
