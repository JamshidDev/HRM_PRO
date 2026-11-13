<script setup>
  import { DismissCircle20Regular } from '@vicons/fluent'
  import { UISelect, UIDepartmentSelect } from '@/components/index.js'
  import { useTariffGridStore, useComponentStore } from '@/store/modules/index.js'

  const store = useTariffGridStore()
  const componentStore = useComponentStore()

  const pickOrg = ref([]) // UISelect (tree) tanlagan korxona [{id,name,...}]
  const orgCheck = ref([]) // tree expanded id'lar
  const pickDepts = ref([]) // tanlangan bo'limlar [{id,name}] (joriy korxona bo'yicha)

  // Bo'limlar faqat AYNAN bitta korxona tanlanganda (aks holda qaysi org noaniq).
  const singleOrgId = computed(() => (pickOrg.value.length === 1 ? pickOrg.value[0].id : null))

  const onPickOrg = (v) => {
    pickOrg.value = v
    pickDepts.value = []
  }

  // "+ Qo'shish": bo'lim tanlangan (va bitta korxona) → bo'limlar; aks holda tanlangan BARCHA korxona.
  const onAdd = () => {
    if (!pickOrg.value.length) return
    if (pickDepts.value.length && singleOrgId.value) {
      store.addScopeDepts(pickDepts.value, pickOrg.value[0].name)
      pickDepts.value = []
    } else {
      for (const o of pickOrg.value) store.addScopeOrg({ id: o.id, name: o.name })
      pickOrg.value = []
      pickDepts.value = []
    }
  }

  onMounted(() => {
    if (!componentStore.structureList.length) componentStore._structures()
  })
</script>

<template>
  <div class="flex flex-col">
    <p class="ts-hint">{{ $t('tariffGrid.scope.wholeOrgHint') }}</p>

    <!-- Birikuv qurish -->
    <div class="grid grid-cols-12 gap-3 items-end mt-3">
      <div class="col-span-12 md:col-span-5">
        <label class="ts-label">{{ $t('tariffGrid.scope.organization') }}</label>
        <UISelect
          :options="componentStore.structureList"
          :model-v="pickOrg"
          @updateModel="onPickOrg"
          :checked-val="orgCheck"
          @updateCheck="(v) => (orgCheck = v)"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          :loading="componentStore.structureLoading"
          :multiple="true"
        />
      </div>
      <div class="col-span-12 md:col-span-5">
        <label class="ts-label">{{ $t('tariffGrid.scope.departments') }}</label>
        <UIDepartmentSelect
          v-model="pickDepts"
          :organization="singleOrgId"
          multiple
          return-object
        />
      </div>
      <div class="col-span-12 md:col-span-2">
        <n-button block type="primary" :disabled="!pickOrg.length" @click="onAdd">
          + {{ $t('tariffGrid.scope.add') }}
        </n-button>
      </div>
    </div>

    <!-- Biriktirilgan ro'yxat — korxonalar | bo'limlar (vertikal chiziq bilan) -->
    <div class="ts-added mt-4">
      <div
        v-if="!store.scopeForm.organization_ids.length && !store.scopeForm.department_ids.length"
        class="ts-empty"
      >
        {{ $t('tariffGrid.scope.empty') }}
      </div>

      <div v-else class="ts-cols">
        <!-- Korxonalar -->
        <div class="ts-col-left">
          <p class="ts-group">
            {{ $t('tariffGrid.scope.addedOrgs') }} ({{ store.scopeForm.organization_ids.length }})
          </p>
          <div v-if="store.scopeForm.organization_ids.length" class="ts-list">
            <div v-for="id in store.scopeForm.organization_ids" :key="'o' + id" class="ts-item">
              <span class="ts-item-name">{{ store.scopeOrgLabels[id] || id }}</span>
              <n-button quaternary circle size="tiny" type="error" @click="store.removeScopeOrg(id)">
                <template #icon><n-icon :component="DismissCircle20Regular" /></template>
              </n-button>
            </div>
          </div>
          <div v-else class="ts-col-empty">—</div>
        </div>

        <!-- Bo'limlar -->
        <div class="ts-col-right">
          <p class="ts-group">
            {{ $t('tariffGrid.scope.addedDepts') }} ({{ store.scopeForm.department_ids.length }})
          </p>
          <div v-if="store.scopeForm.department_ids.length" class="ts-list">
            <div v-for="id in store.scopeForm.department_ids" :key="'d' + id" class="ts-item">
              <div class="flex flex-col min-w-0">
                <span class="ts-item-name">{{ store.scopeDeptLabels[id]?.name || id }}</span>
                <span v-if="store.scopeDeptLabels[id]?.org_name" class="ts-item-sub">
                  {{ store.scopeDeptLabels[id].org_name }}
                </span>
              </div>
              <n-button quaternary circle size="tiny" type="error" @click="store.removeScopeDept(id)">
                <template #icon><n-icon :component="DismissCircle20Regular" /></template>
              </n-button>
            </div>
          </div>
          <div v-else class="ts-col-empty">—</div>
        </div>
      </div>
    </div>

    <div class="ts-footer">
      <n-button quaternary @click="store.scopeVisible = false">{{ $t('content.cancel') }}</n-button>
      <n-button type="primary" :loading="store.scopeSaving" @click="store._saveScope">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </div>
</template>

<style scoped>
  .ts-label {
    display: block;
    margin-bottom: 6px;
    color: var(--textColor1);
    font-size: 13px;
    font-weight: 500;
  }
  .ts-hint {
    font-size: 12px;
    color: var(--textColor2, #475467);
    background: var(--surface-ground, rgba(148, 163, 184, 0.06));
    border-radius: 12px;
    padding: 10px 12px;
  }
  .ts-added {
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 14px;
    padding: 12px 14px;
    min-height: 90px;
  }
  .ts-empty {
    color: var(--textColor3, #98a2b3);
    font-size: 13px;
    text-align: center;
    padding: 20px 0;
  }
  .ts-cols {
    display: grid;
    grid-template-columns: 1fr;
  }
  .ts-col-right {
    border-top: 1px solid var(--surface-line, #e5e7eb);
    padding-top: 12px;
    margin-top: 12px;
  }
  @media (min-width: 768px) {
    .ts-cols {
      grid-template-columns: 1fr 1fr;
    }
    .ts-col-left {
      border-right: 1px solid var(--surface-line, #e5e7eb);
      padding-right: 16px;
    }
    .ts-col-right {
      border-top: none;
      padding-top: 0;
      margin-top: 0;
      padding-left: 16px;
    }
  }
  .ts-col-empty {
    color: var(--textColor3, #98a2b3);
    font-size: 13px;
    padding: 4px 0;
  }
  .ts-group {
    font-size: 12px;
    font-weight: 600;
    color: var(--textColor2, #475467);
    margin-bottom: 8px;
  }
  .ts-list {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-right: 4px;
  }
  .ts-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: var(--surface-section, #fff);
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 10px;
    padding: 7px 10px 7px 12px;
  }
  .ts-item:hover {
    border-color: var(--primary-color);
  }
  .ts-item-name {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
  .ts-item-sub {
    font-size: 11px;
    color: var(--textColor2, #475467);
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  .ts-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 14px;
    margin-top: 12px;
    border-top: 1px solid var(--surface-line, #e5e7eb);
  }
  .ts-added :deep(.n-select),
  .grid :deep(.n-select) {
    width: 100%;
    --n-height: 40px !important;
    --n-border-radius: 16px !important;
  }
</style>
