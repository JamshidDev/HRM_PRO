<script setup>
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import { useComponentStore } from '@/store/modules/index.js'
  import { SuperSelect, UIDepartmentSelect } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import ApiService from '@/service/ApiService.js'
  import i18n from '@/i18n/index.js'
  import validationRules from '@/utils/validationRules.js'
  import {
    CheckmarkCircle16Filled,
    DismissCircle16Regular,
    Warning16Filled
  } from '@vicons/fluent'

  const { t } = i18n.global

  // 26 — xodimlarni shtati bilan boshqa korxonaga o'tkazish (MK 156).
  const MAX_WORKERS = 50
  const store = useCommandFormStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  const rules = validationRules.form_26

  // Manba korxonaning o'zi tanlanmasin.
  const sourceOrgId = computed(() => store.payload.organization_id?.[0]?.id ?? null)
  const disableSource = (nodes) =>
    (nodes ?? []).map((n) => ({
      ...n,
      disabled: n.id === sourceOrgId.value,
      children: n.children?.length ? disableSource(n.children) : undefined
    }))
  const orgOptions = computed(() => disableSource(componentStore.allStructureList))

  // Hujjatga kichik harf bilan yoziladi, ro'yxatda bosh harf bilan ko'rsatiladi.
  const reasonOptions = computed(() =>
    componentStore.reasonTypes.map((v) => ({ ...v, name: v.name.charAt(0).toUpperCase() + v.name.slice(1) }))
  )

  // Bo'limlar daraxtini UIDepartmentSelect o'zi yuklaydi (source=all — boshqa korxona ham).
  const onChangeTargetOrg = () => {
    store.form_26.target_department_id = null
  }

  // Kadrlar bo'limi mas'uli — manba korxona xodimlaridan (80-formadagidek).
  const hrList = reactive({ list: [], total: 0, loading: false, search: null, page: 1, reqId: 0 })
  const perPage = 100
  const hrOptions = computed(() => {
    const picked = store.form_26.hr_option
    return picked ? [picked, ...hrList.list.filter((v) => v.id !== picked.id)] : hrList.list
  })
  const loadHr = (infinity = false) => {
    const organizationId = store.workerParams.organization_id
    if (!organizationId) return
    const reqId = ++hrList.reqId
    hrList.loading = true
    ApiService.workerService
      ._search({
        params: { organization_id: organizationId, page: hrList.page, per_page: perPage, search: hrList.search }
      })
      .then((res) => {
        if (reqId !== hrList.reqId) return
        const data = res.data.data.data.map((v) => ({
          id: v.id,
          name: `${v.worker.last_name} ${v.worker.first_name} ${v.worker.middle_name}`,
          position: v.position?.name || v?.post_name,
          photo: v.worker?.photo
        }))
        hrList.total = res.data.data.total
        hrList.list = infinity ? [...hrList.list, ...data] : data
      })
      .finally(() => {
        if (reqId === hrList.reqId) hrList.loading = false
      })
  }
  const onSearchHr = (v) => {
    hrList.page = 1
    hrList.search = v
    loadHr()
  }
  const onScrollHr = () => {
    hrList.page += 1
    loadHr(true)
  }
  const onChangeHr = (id) => {
    store.form_26.hr_option = hrOptions.value.find((v) => v.id === id) ?? null
  }
  watch(
    () => store.workerParams.organization_id,
    (v, old) => {
      if (old !== undefined && v !== old) {
        store.form_26.hr_worker_position_id = null
        store.form_26.hr_option = null
      }
      hrList.page = 1
      hrList.search = null
      loadHr()
    },
    { immediate: true }
  )

  // Ko'pi bilan 50 xodim — ortig'i olib tashlanadi.
  watch(
    () => store.payload.workers.length,
    (n) => {
      if (n > MAX_WORKERS) {
        store.payload.workers = store.payload.workers.slice(0, MAX_WORKERS)
        $Alert.validation(t('commandPage.form_26.max_workers', { max: MAX_WORKERS }))
      }
    }
  )

  // Tanlangan xodimlar holati o'tkazish sanasiga qarab tekshiriladi.
  const availability = ref({})
  const checking = ref(false)
  let checkReq = 0
  let checkTimer = null
  const runCheck = () => {
    const ids = store.payload.workers
    const date = store.form_26.transfer_date
    if (!ids.length || !date) {
      availability.value = {}
      return
    }
    const reqId = ++checkReq
    checking.value = true
    ApiService.commandService
      ._orgTransferAvailability({
        params: { worker_position_ids: ids.join(','), date: Utils.timeToZone(date) }
      })
      .then((res) => {
        if (reqId !== checkReq) return
        availability.value = Object.fromEntries((res.data.data ?? []).map((v) => [v.worker_position_id, v]))
      })
      .finally(() => {
        if (reqId === checkReq) checking.value = false
      })
  }
  watch(
    () => [store.payload.workers.join(','), store.form_26.transfer_date],
    () => {
      clearTimeout(checkTimer)
      checkTimer = setTimeout(runCheck, 300)
    },
    { immediate: true }
  )

  // Qidiruvdan keyin ro'yxat almashadi — tanlanganlarning ism/lavozimi shu yerda saqlanadi.
  const picked = reactive({})
  watch(
    () => [store.payload.workers.join(','), store.workerList],
    () => {
      for (const id of store.payload.workers) {
        const found = store.workerList.find((v) => v.id === id)
        if (found) picked[id] = { name: found.name, position: found.position }
      }
    },
    { immediate: true }
  )

  const fmt = (d) => (d ? Utils.timeOnlyDate(d) : '…')
  const rows = computed(() =>
    store.payload.workers.map((id, idx) => {
      const w = picked[id] ?? store.workerList.find((v) => v.id === id)
      const a = availability.value[id]
      let issue = null
      if (a?.vacation) {
        issue = t('commandPage.form_26.on_vacation', {
          type: a.vacation.name,
          from: fmt(a.vacation.from),
          to: fmt(a.vacation.to)
        })
      } else if (a?.sick_leave) {
        issue = t('commandPage.form_26.on_sick_leave', { from: fmt(a.sick_leave.from), to: fmt(a.sick_leave.to) })
      } else if (a?.pending_command) {
        issue = t('commandPage.form_26.pending_command')
      }
      return {
        id,
        idx: idx + 1,
        name: w?.name ?? a?.full_name ?? `#${id}`,
        position: w?.position ?? '',
        checked: Boolean(a),
        issue
      }
    })
  )
  const blocked = computed(() => rows.value.filter((r) => r.issue))

  const onRemoveWorker = (id) => {
    store.payload.workers = store.payload.workers.filter((v) => v !== id)
  }

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate((error) => {
      if (error) return
      if (!store.payload.workers.length) {
        $Alert.validation(t('commandPage.form_26.no_workers'))
        return
      }
      if (blocked.value.length) {
        $Alert.validation(t('commandPage.form_26.blocked_save', { count: blocked.value.length }))
        return
      }
      data = {
        ...mainData,
        worker_positions: store.payload.workers.map((id) => ({ id })),
        target_organization_id: store.form_26.target_organization_id,
        target_department_id: store.form_26.target_department_id || undefined,
        reason: store.form_26.reason,
        transfer_date: Utils.timeToZone(store.form_26.transfer_date),
        hr_worker_position_id: store.form_26.hr_worker_position_id
      }
    })
    return { data, isValid: Boolean(data) }
  }
  const validateForm = async () => {
    await formRef.value?.validate()
  }
  defineExpose({ onSubmit, validateForm })

  onMounted(() => {
    if (!componentStore.allStructureList.length) componentStore._allStructures()
    componentStore.reasonTypes = []
    componentStore._reasonTypes(26)
  })
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_26"
    :rules="rules"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t('commandPage.form_26.target_organization')" path="target_organization_id">
        <n-tree-select
          v-model:value="store.form_26.target_organization_id"
          :options="orgOptions"
          key-field="id"
          label-field="name"
          children-field="children"
          filterable
          :loading="componentStore.allStructureLoading"
          :placeholder="$t('commandPage.form_26.target_organization_ph')"
          @update:value="onChangeTargetOrg"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t('commandPage.form_26.target_department')" path="target_department_id">
        <UIDepartmentSelect
          v-model="store.form_26.target_department_id"
          :organization="store.form_26.target_organization_id"
          source="all"
          :placeholder="$t('commandPage.form_26.target_department_ph')"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_26.reason')" path="reason">
        <n-select
          v-model:value="store.form_26.reason"
          :options="reasonOptions"
          label-field="name"
          value-field="id"
          :loading="componentStore.reasonTypeLoading"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_26.transfer_date')" path="transfer_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_26.transfer_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_26.hr_worker')" path="hr_worker_position_id">
        <SuperSelect
          :disabled="!store.workerParams.organization_id"
          :options="hrOptions"
          :loading="hrList.loading"
          :total-count="hrList.total"
          :per-page="perPage"
          v-model:value="store.form_26.hr_worker_position_id"
          v-model:search="hrList.search"
          value-field="id"
          @update:value="onChangeHr"
          @onSearch="onSearchHr"
          @onScrollEv="onScrollHr"
        />
      </n-form-item>
    </div>

    <div class="col-span-12 ot-list">
      <div class="ot-head">
        <span class="ot-title">{{ $t('commandPage.form_26.selected') }}</span>
        <n-tag size="small" round :bordered="false" :type="store.payload.workers.length >= MAX_WORKERS ? 'warning' : 'default'">
          {{ store.payload.workers.length }} / {{ MAX_WORKERS }}
        </n-tag>
        <n-spin v-if="checking" :size="14" />
      </div>

      <n-alert v-if="blocked.length" type="warning" :bordered="false" class="mb-2">
        {{ $t('commandPage.form_26.blocked_info', { count: blocked.length }) }}
      </n-alert>
      <div v-if="!store.form_26.transfer_date && store.payload.workers.length" class="ot-hint">
        {{ $t('commandPage.form_26.pick_date_hint') }}
      </div>

      <div v-if="!rows.length" class="ot-empty">{{ $t('commandPage.form_26.empty') }}</div>
      <div v-for="r in rows" :key="r.id" class="ot-row" :class="{ 'is-blocked': r.issue }">
        <span class="ot-idx">{{ r.idx }}</span>
        <div class="ot-main">
          <div class="ot-name">{{ r.name }}</div>
          <div class="ot-pos">{{ r.position }}</div>
          <div v-if="r.issue" class="ot-issue">
            <n-icon :component="Warning16Filled" />
            <span>{{ r.issue }}</span>
          </div>
        </div>
        <n-icon v-if="r.checked && !r.issue" class="ot-ok" :component="CheckmarkCircle16Filled" />
        <n-button size="tiny" quaternary type="error" @click="onRemoveWorker(r.id)">
          <template #icon>
            <n-icon :component="DismissCircle16Regular" />
          </template>
        </n-button>
      </div>
    </div>
  </n-form>
</template>

<style scoped>
  .ot-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ot-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
  }
  .ot-title {
    font-weight: 600;
    font-size: 13px;
  }
  .ot-hint,
  .ot-empty {
    font-size: 12px;
    color: var(--n-text-color-3, #8a8f98);
  }
  .ot-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid rgb(128 128 128 / 0.18);
    border-radius: 8px;
  }
  .ot-row.is-blocked {
    border-color: rgb(240 160 32 / 0.55);
    background: rgb(240 160 32 / 0.08);
  }
  .ot-idx {
    min-width: 22px;
    font-size: 12px;
    opacity: 0.6;
    font-variant-numeric: tabular-nums;
    padding-top: 1px;
  }
  .ot-main {
    flex: 1;
    min-width: 0;
  }
  .ot-name {
    font-weight: 500;
    font-size: 13px;
  }
  .ot-pos {
    font-size: 12px;
    opacity: 0.7;
  }
  .ot-issue {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 12px;
    color: #d08a12;
  }
  .ot-ok {
    color: #18a058;
    margin-top: 2px;
  }
</style>
