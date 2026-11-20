<script setup>
  import { computed } from 'vue'
  import { UISegmentTabs } from '@/components/index.js'
  import { useUserRoleStore } from '@/store/modules/index.js'
  import { Info16Regular, Warning16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import {
    SCOPE_LEVELS,
    SCOPE_TYPES,
    isAdminOnlyScope,
    isDeptScopedPermission,
    permissionGroupPrefix
  } from '../roleScope.js'
  import { PERMISSION_GROUPS } from '@/utils/permissionGroups.js'

  // Rol formasining doira paneli: kesim → doira turi → izoh; kesim almashganda ruxsat tozalash tasdig'i.
  const { t } = i18n.global
  const store = useUserRoleStore()

  const levelTabs = computed(() =>
    SCOPE_LEVELS.map((id) => ({ id, name: t(`userRole.form.level_${id}`) }))
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

  const types = computed(() => SCOPE_TYPES[store.payload.scope_level] ?? [])

  const hint = computed(() => {
    const { scope_level: l, scope_type: s } = store.payload
    const who = isAdminOnlyScope(l, s) ? t('userRole.form.grantAdminOnly') : t('userRole.form.grantDelegated')
    const ask =
      l === 'department'
        ? t('userRole.form.askOrgDept')
        : s === 'all'
          ? t('userRole.form.askNone')
          : t('userRole.form.askOrg')
    return { who, ask }
  })

  // Tasdiq oynasida olib tashlanadigan guruh nomlari.
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
  <div class="scope-panel">
    <div class="scope-row">
      <span class="scope-lbl">{{ $t('userRole.form.scopeLevel') }}</span>
      <span class="scope-sub">{{ $t('userRole.form.scopeLevelHint') }}</span>
      <!-- key: tasdiq kutilayotganda/bekor qilinganda segment haqiqiy kesimga qaytib chiziladi. -->
      <UISegmentTabs
        :key="`${store.payload.scope_level}-${store.pendingLevel ? 'pending' : 'ok'}`"
        v-model="level"
        :tabs="levelTabs"
        size="sm"
        variant="elevated"
      />
    </div>

    <div class="scope-row">
      <span class="scope-lbl">{{ $t('userRole.form.scopeKind') }}</span>
      <n-radio-group
        v-model:value="store.payload.scope_type"
        class="scope-cards"
        :style="{ '--cols': types.length }"
      >
        <label
          v-for="tp in types"
          :key="tp"
          class="scope-card"
          :class="{ active: store.payload.scope_type === tp }"
        >
          <n-radio :value="tp" />
          <span class="flex flex-col min-w-0">
            <span class="font-semibold text-sm">{{ $t(`userRole.form.scope_${tp}`) }}</span>
            <span class="scope-desc">{{ $t(`userRole.form.scope_${tp}_desc`) }}</span>
          </span>
        </label>
      </n-radio-group>
    </div>

    <div class="scope-row">
      <div class="scope-hint">
        <n-icon size="16" class="mt-0.5 flex-none"><Info16Regular /></n-icon>
        <span>
          <b>{{ hint.who }}</b> {{ hint.ask }}
          <template v-if="store.payload.scope_level === 'department'">{{ $t('userRole.form.deptOffHint') }}</template>
        </span>
      </div>
    </div>

    <div v-if="store.pendingLevel" class="scope-row">
      <div class="scope-warn">
        <div class="flex gap-2">
          <n-icon size="16" class="mt-0.5 flex-none"><Warning16Regular /></n-icon>
          <span>
            <b>{{ $t('userRole.form.pruneTitle', { n: store.pendingLevel.ids.length }) }}</b>
            {{ $t('userRole.form.pruneBody') }} {{ pendingGroups.join(', ') }}.
          </span>
        </div>
        <div class="flex gap-2 justify-end">
          <n-button size="small" @click="store.cancelPendingLevel()">{{ $t('content.cancel') }}</n-button>
          <n-button size="small" type="primary" @click="store.confirmPendingLevel()">
            {{ $t('userRole.form.pruneConfirm') }}
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .scope-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .scope-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .scope-lbl {
    font-size: 13px;
    font-weight: 500;
    color: var(--textColor1);
  }
  .scope-sub {
    font-size: 12px;
    color: var(--textColor3);
    margin-top: -4px;
  }
  .scope-cards {
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
    gap: 10px;
  }
  .scope-card {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    height: 100%;
    padding: 12px 14px;
    border: 1px solid var(--surface-line);
    border-radius: 10px;
    background: var(--surface-section);
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .scope-card:hover {
    border-color: var(--primary-color);
  }
  .scope-desc {
    font-size: 12px;
    color: var(--textColor3);
  }
  .scope-card.active {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color) inset;
  }
  .scope-hint {
    display: flex;
    gap: 8px;
    font-size: 13px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--fig-chip-brand-bg);
    color: var(--fig-chip-brand-text);
  }
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
  @media (max-width: 760px) {
    .scope-cards {
      grid-template-columns: 1fr;
    }
  }
</style>
