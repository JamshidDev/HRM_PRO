<script setup>
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import { useComponentStore } from '@/store/modules/index.js'
  import { SuperSelect } from '@/components/index.js'
  import UIDepartment from '@/components/ui/UIDepartment.vue'
  import UIHelper from '@utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'
  import { Warning24Filled, DocumentDismiss20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useCommandFormStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)
  const termError = ref(null)
  const DAY = 86400000

  const form = computed(() => store.form_8)
  const dayStart = (v) => new Date(`${v}T00:00:00`).getTime()
  const fmtDate = (v) =>
    String(v || '')
      .split('-')
      .reverse()
      .join('.')

  // Xodim butun tizimdan JSHSHIR boshi bo'yicha qidiriladi; variantda asosiy shtat / bo'shatish holati.
  const candidates = reactive({
    list: [],
    total: 0,
    loading: false,
    search: null,
    page: 1,
    reqId: 0
  })
  const perPage = 50

  const toOption = (v) => ({
    ...v,
    name: Utils.combineFullName(v),
    position: v.pin,
    subPosition: v.main_position
      ? t('commandPage.form_8.optionMain', { organization: v.main_position.organization })
      : v.termination
        ? t('commandPage.form_8.optionDismissed', {
            number: v.termination.command_number,
            date: fmtDate(v.termination.command_date)
          })
        : t('commandPage.form_8.optionNoTermination')
  })

  const workerOptions = computed(() => {
    const picked = form.value.worker
    return picked ? [picked, ...candidates.list.filter((v) => v.id !== picked.id)] : candidates.list
  })

  const loadCandidates = (infinity = false) => {
    const digits = String(candidates.search || '').replace(/\D/g, '')
    const reqId = ++candidates.reqId
    if (digits.length < 4) {
      candidates.list = []
      candidates.total = 0
      candidates.loading = false
      return
    }
    candidates.loading = true
    $ApiService.commandService
      ._reinstatementCandidates({
        params: { search: digits, page: candidates.page, per_page: perPage }
      })
      .then((res) => {
        if (reqId !== candidates.reqId) return
        const data = res.data.data.data.map(toOption)
        candidates.total = res.data.data.total
        candidates.list = infinity ? [...candidates.list, ...data] : data
      })
      .finally(() => {
        if (reqId === candidates.reqId) candidates.loading = false
      })
  }
  const onSearchWorker = (v) => {
    candidates.page = 1
    candidates.search = v
    loadCandidates()
  }
  const onScrollWorker = () => {
    candidates.page += 1
    loadCandidates(true)
  }

  // Tahrirda (eski saqlangan forma ham) tanlangan xodim select'da ko'rinsin.
  if (form.value.worker) {
    if (!form.value.worker.name) form.value.worker = toOption(form.value.worker)
    if (!form.value.worker_id) form.value.worker_id = form.value.worker.id
  }

  // Bo'shatish buyrug'i topilgach — progul boshlanishi bo'shatilgan kundan keyingi kun.
  const loadTermination = (workerId) => {
    termError.value = null
    form.value.termination = null
    $ApiService.commandService
      ._reinstatementTarget({ params: { worker_id: workerId } })
      .then((res) => {
        form.value.termination = res.data.data
        const d = res.data.data?.dismissed_at
        if (d && !form.value.from) form.value.from = dayStart(d) + DAY
      })
      .catch((e) => {
        termError.value = e?.response?.data?.message || t('commandPage.form_8.noTermination')
      })
  }

  const onChangeWorker = (id) => {
    const worker = workerOptions.value.find((v) => v.id === id) ?? null
    form.value.worker = worker
    form.value.termination = null
    termError.value = null
    if (!worker) return
    if (worker.main_position) {
      $Alert.warning(t('commandPage.form_8.mainPosition', worker.main_position))
    }
    loadTermination(worker.id)
  }
  // Progul tiklanishdan oldingi kungacha.
  watch(
    () => form.value.position_date,
    (v) => {
      if (v && !form.value.to) form.value.to = v - DAY
    }
  )

  // Bo'limlar daraxti buyruq korxonasi bo'yicha; birinchi yuklashda tiklangan bo'lim/lavozim saqlanadi.
  const loadDepartments = (orgId, reset) => {
    if (reset) {
      form.value.department_id = []
      form.value.department_position_id = null
    }
    componentStore.departmentList = []
    componentStore.departmentPositionList = []
    if (!orgId) return
    componentStore.depParams.organizations = orgId
    componentStore._departmentTree({ own: 1 })
    const dep = form.value.department_id?.[0]?.id
    if (dep) componentStore._departmentPosition(dep)
  }
  watch(
    () => store.payload.organization_id?.[0]?.id,
    (id, old) => loadDepartments(id, old !== undefined),
    { immediate: true }
  )
  const onChangeDepartment = (v) => {
    form.value.department_id = v
    form.value.department_position_id = null
    componentStore.departmentPositionList = []
    if (v.length) componentStore._departmentPosition(v[0].id)
  }

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate((error) => {
      if (error) return
      if (!form.value.worker) {
        $Alert.warning(t('commandPage.form_8.workerRequired'))
        return
      }
      if (!form.value.termination) {
        $Alert.warning(termError.value || t('commandPage.form_8.noTermination'))
        return
      }
      data = {
        ...mainData,
        worker_id: form.value.worker.id,
        workers: undefined,
        worker_position_id: undefined,
        department_position_id: form.value.department_position_id,
        position_date: Utils.timeToZone(form.value.position_date),
        rate: 1,
        from: Utils.timeToZone(form.value.from),
        to: Utils.timeToZone(form.value.to),
        court_name: form.value.court_name,
        court_decision_date: Utils.timeToZone(form.value.court_decision_date)
      }
    })
    return { data, isValid: Boolean(data) }
  }

  const validateForm = async () => {
    await formRef.value?.validate()
  }

  defineExpose({ onSubmit, validateForm })
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_8"
    :rules="validationRules.form_8"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t('commandPage.form_8.pin')" path="worker_id">
        <SuperSelect
          pin-select
          clearable
          placeholder="commandPage.form_8.pinPlaceholder"
          :options="workerOptions"
          :loading="candidates.loading"
          :total-count="candidates.total"
          :per-page="perPage"
          v-model:value="store.form_8.worker_id"
          v-model:search="candidates.search"
          value-field="id"
          @update:value="onChangeWorker"
          @onSearch="onSearchWorker"
          @onScrollEv="onScrollWorker"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 flex items-center">
      <div v-if="form.worker" class="flex items-center gap-3 w-full py-1">
        <n-avatar round :size="40" :src="form.worker.photo || Utils.noAvailableImage" />
        <div class="min-w-0">
          <div class="text-sm font-medium text-textColor1 truncate">
            {{ Utils.combineFullName(form.worker) }}
          </div>
          <div v-if="form.termination" class="text-xs text-textColor3 flex items-center gap-1">
            <n-icon size="14"><DocumentDismiss20Regular /></n-icon>
            {{
              $t('commandPage.form_8.termination', {
                number: form.termination.command_number,
                date: fmtDate(form.termination.command_date),
                position: form.termination.position
              })
            }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="form.worker?.main_position" class="col-span-12 mb-3">
      <div
        class="flex gap-2 items-start rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning"
      >
        <n-icon size="20" class="mt-0.5 flex-shrink-0"><Warning24Filled /></n-icon>
        <div class="font-medium">
          {{ $t('commandPage.form_8.mainPosition', form.worker.main_position) }}
        </div>
      </div>
    </div>
    <div v-if="termError" class="col-span-12 mb-3">
      <div
        class="flex gap-2 items-start rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
      >
        <n-icon size="20" class="mt-0.5 flex-shrink-0"><Warning24Filled /></n-icon>
        <div class="font-medium">{{ termError }}</div>
      </div>
    </div>

    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t('documentPage.form.department')" path="department_id">
        <UIDepartment
          v-model:search="componentStore.depParams.search"
          :model-v="store.form_8.department_id"
          @updateModel="onChangeDepartment"
          :multiple="false"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t('documentPage.form.position')" path="department_position_id">
        <n-select
          :disabled="!store.form_8.department_id.length"
          v-model:value="store.form_8.department_position_id"
          filterable
          :options="componentStore.departmentPositionList"
          label-field="name"
          value-field="id"
          :loading="componentStore.departmentPositionLoading"
          :render-tag="UIHelper.selectRender.value"
          :render-label="UIHelper.selectRender.labelColor"
        />
      </n-form-item>
    </div>

    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_8.position_date')" path="position_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_8.position_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_8.from')" path="from">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_8.from"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_8.to')" path="to">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_8.to"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-8">
      <n-form-item :label="$t('commandPage.form_8.court_name')" path="court_name">
        <n-input
          v-model:value="store.form_8.court_name"
          :placeholder="$t('commandPage.form_8.courtPlaceholder')"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_8.court_decision_date')" path="court_decision_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_8.court_decision_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
