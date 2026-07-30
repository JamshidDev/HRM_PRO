<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { computed, ref } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useUserRoleStore } from '@/store/modules/index.js'
  import {
    PERMISSION_GROUPS,
    ACTION_LABELS,
    ACTION_ORDER,
  } from '@/utils/permissionGroups.js'

  const formRef = ref(null)
  const store = useUserRoleStore()
  const query = ref('')
  const t = i18n.global.t

  // name -> {id, name}
  const permByName = computed(() => {
    const m = new Map()
    for (const p of store.originAllPermissionList || []) m.set(p.name, p)
    return m
  })
  const selectedSet = computed(() => new Set(store.payload.permissions))

  const idOf = (name) => permByName.value.get(name)?.id ?? null
  const has = (name) => permByName.value.has(name)
  const actionsFor = (prefix) =>
    ACTION_ORDER.filter((a) => has(`${prefix}-${a}`))

  const isOn = (name) => {
    const id = idOf(name)
    return id != null && selectedSet.value.has(id)
  }
  const setOn = (name, val) => {
    const id = idOf(name)
    if (id == null) return
    const arr = store.payload.permissions
    const i = arr.indexOf(id)
    if (val && i === -1) arr.push(id)
    else if (!val && i !== -1) arr.splice(i, 1)
  }

  // sub-guruh switchlari: read/write/delete bo'lsa ular; bo'lmasa (faqat bazaviy
  // slug — bu ko'rish/list ruxsati) bitta "Ko'rish" switch.
  const groupSwitches = (g) => {
    const acts = actionsFor(g.prefix)
    if (acts.length)
      return acts.map((a) => ({ name: `${g.prefix}-${a}`, label: ACTION_LABELS[a] }))
    if (has(g.prefix)) return [{ name: g.prefix, label: ACTION_LABELS.read }]
    return []
  }
  const groupActions = (g) => groupSwitches(g).map((s) => s.name)
  const groupAllOn = (g) => {
    const a = groupActions(g)
    return a.length > 0 && a.every((n) => isOn(n))
  }
  const toggleGroup = (g, val) => groupActions(g).forEach((n) => setOn(n, val))

  // modulda biriktirilgan (ON) permissionlar soni — tab badge
  const moduleCount = (mod) => {
    let c = 0
    for (const g of mod.groups)
      for (const n of groupActions(g)) if (isOn(n)) c++
    return c
  }

  // qidiruv bo'yicha ko'rinadigan sub-guruhlar (label bo'yicha) + mavjud slug bo'lganlar
  const visibleGroups = (mod) => {
    const q = query.value.trim().toLowerCase()
    return mod.groups.filter(
      (g) =>
        groupSwitches(g).length > 0 &&
        (!q || t(g.label).toLowerCase().includes(q))
    )
  }

  // faqat mavjud slug'ga ega guruhi bor modullar
  const visibleModules = computed(() =>
    PERMISSION_GROUPS.filter((m) => m.groups.some((g) => groupSwitches(g).length > 0))
  )

  // xaritada YO'Q permissionlar -> "Boshqa" tab
  const mappedNames = computed(() => {
    const s = new Set()
    for (const mod of PERMISSION_GROUPS)
      for (const g of mod.groups)
        for (const a of ACTION_ORDER) s.add(`${g.prefix}-${a}`)
    return s
  })
  const otherPerms = computed(() => {
    const q = query.value.trim().toLowerCase()
    return (store.originAllPermissionList || []).filter(
      (p) => !mappedNames.value.has(p.name) && (!q || p.name.toLowerCase().includes(q))
    )
  })
  const otherCount = computed(
    () => otherPerms.value.filter((p) => selectedSet.value.has(p.id)).length
  )

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) store._create()
        else store._update()
      }
    })
  }
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.userRole" :model="store.payload">
    <div style="min-height: calc(100vh - 120px)">
      <n-form-item :label="$t(`userRole.form.name`)" path="name">
        <n-input type="text" v-model:value="store.payload.name" />
      </n-form-item>

      <n-form-item :label="$t(`userRole.form.permissions`)" path="permissions">
        <div class="w-full">
          <div class="mb-2 flex items-center gap-2">
            <n-input
              clearable
              class="flex-1"
              v-model:value="query"
              type="text"
              :placeholder="$t('content.search')"
            />
            <n-tag type="success" round>
              Tanlangan: {{ store.payload.permissions.length }}
            </n-tag>
          </div>

          <n-tabs type="line" animated class="perm-tabs">
            <n-tab-pane
              v-for="mod in visibleModules"
              :key="mod.label"
              :name="mod.label"
            >
              <template #tab>
                <span>{{ $t(mod.label) }}</span>
                <span class="perm-count">{{ moduleCount(mod) }}</span>
              </template>

              <div
                class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-2 h-[calc(100vh-330px)] overflow-y-auto pr-1"
              >
                <div
                  v-for="g in visibleGroups(mod)"
                  :key="g.prefix"
                  class="border border-surface-line rounded-xl p-3"
                >
                  <div class="flex items-center justify-between mb-2 pb-2 border-b border-surface-line">
                    <span class="font-semibold text-sm">{{ $t(g.label) }}</span>
                    <n-switch
                      size="small"
                      :value="groupAllOn(g)"
                      @update:value="(v) => toggleGroup(g, v)"
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <div
                      v-for="sw in groupSwitches(g)"
                      :key="sw.name"
                      class="flex items-center justify-between"
                    >
                      <span class="text-sm text-secondary">{{ sw.label }}</span>
                      <n-switch
                        size="small"
                        :value="isOn(sw.name)"
                        @update:value="(v) => setOn(sw.name, v)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane v-if="otherPerms.length" name="__other">
              <template #tab>
                <span>Boshqa</span>
                <span class="perm-count">{{ otherCount }}</span>
              </template>
              <div
                class="h-[calc(100vh-330px)] overflow-y-auto pt-2 pr-1"
              >
                <n-checkbox-group v-model:value="store.payload.permissions">
                  <div class="grid grid-cols-2 gap-2">
                    <n-checkbox
                      class="border border-surface-line p-1 rounded-lg"
                      v-for="p in otherPerms"
                      :key="p.id"
                      :value="p.id"
                    >
                      <span class="leading-[1.2] text-secondary text-sm">{{ p.name }}</span>
                    </n-checkbox>
                  </div>
                </n-checkbox-group>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>
  .perm-count {
    display: inline-block;
    min-width: 18px;
    padding: 0 5px;
    margin-left: 6px;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
    border-radius: 9px;
    background: var(--primary-color, #2080f0);
    color: #fff;
  }
</style>
